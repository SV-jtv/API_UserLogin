import express from 'express'
import { PORT, SECRET_JWT_KEY } from './config.js'
import { UserRepository } from './user-repository.js';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(cookieParser())
app.set('view engine', 'ejs')

//Endpoints
app.get('/', (req, res) => {
    const { user } = req.session
    res.render('index', user)
});

app.post('/register', async (req, res) => {
    //aqui el body es el cuerpo de la petición
    const { username, password } = req.body
    console.log(req.body)
    try {
        const id = await UserRepository.create({ username, password });
        res.send({ id })
    } catch (error) {
        //No es buena idea mandar el error del repositorio
        res.status(400).send(error.message)
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        console.log("llego aqui")
        const user = await UserRepository.login({ username, password })
        console.log("llego aqui 1")
        const token = jwt.sign(
            { id: user._id, username: user.username },
            SECRET_JWT_KEY,
            {
                expiresIn: '1h'
            })
        console.log("llego aqui 2")
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
        res.status(401).send(error.message)
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port${PORT}`);
});