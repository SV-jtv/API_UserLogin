import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js';
import recursosRoutes from "./routes/recursos.js"
import reservesRoutes from "./routes/reserves.js"


const app = express();

app.use(cookieParser())
app.use(express.json());

// Configuración de vistas
app.use(express.static("./public"));//carpeta publica pel css
app.set('view engine', 'ejs');//Fem servir el motor ejs
app.set('views', "./views"); //carpeta on desem els arxius .ejs

// ##################################################################################################################

//inicio middleware
app.use((req, res, next) => {
    const token = req.cookies.access_token
    req.session = { user: null }
    try {
        const datas = jwt.verify(token, SECRET_JWT_KEY)
        req.session.user = datas
    } catch (error) {
        req.session.user = null
    }
    next() // seguir a la siguiente ruta o middleware.
})

//Endpoints
app.get('/', (req, res) => {
    const { user } = req.session
    res.render('index', user)
});

app.get('/home', (req, res) => {
    const { user } = req.session
    if (!user) return res.status(403).send('acceso no autorizado')
    res.render('home', user)
});

app.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;
        await UserRepository.create({username, password});
        res.redirect('/');
    } catch (error) {
        res.status(400).send('index', {
            user: null,
            error: error.message
        })
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        //console.log("llego aqui")
        const user = await UserRepository.login({ username, password })
        //console.log("llego aqui 1")
        const token = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_JWT_KEY,
            { expiresIn: '1h' });
        //console.log("llego aqui 2")
        res
            .cookie('access_token', token, {
                httpOnly: true, //la cookie solo se puede acceder en el servidor, no podrem fer un document.cookie
                //secure:true, //la cookie solo funciona en https
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict', //la cookie es pot accedir dins del domini
                maxAge: 1000 * 60 * 60 //la cookie te un temps de validesa d'una hora
            })
            .send({ user, token })
    } catch (error) {
        //401 = no autorització
        res.status(401).send('index', { 
            user: null,
            error: error.message 
        })
    }
});

app.post('/logout', (req, res) => {
    res
        .clearCookie('access_token')
        .json({ message: 'logout successfull' })
        .send('logout')
        .redirect('/');
});


// Rutas protegidas
app.use("/recursos", recursosRoutes);
app.use("/reserves", reservesRoutes);

app.get('/protected', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.redirect('/home');
});


// ##################################################################################################################

//Ultima línea simpre. Función para escuchar
app.listen(PORT, () => {
    console.log(`Server running on port${PORT}`);
});

//npx kill-port 3000
//para matar el proceso