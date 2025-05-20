import express from 'express';
import fs from 'fs';

const router = express.Router();

const readRecursos = () => {
    try {
        const data = fs.readFileSync("./data/recursos.json");
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
    }
};
const writeRecursos = (data) => {
    try {
        fs.writeFileSync("./data/recursos.json", JSON.stringify(data));
    } catch (error) {
        console.error(error);
    }
};

// Middleware para verificar autenticación
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
};

router.use(requireAuth);


//GET recursos
router.get('/', (req, res) => {
    const { user } = req.session
    const data = readRecursos();
    res.render("recursos", { user, data})
    //res.json(data.recursos);
});

// Get recursos/:id
router.get("/:id", (req, res) => {
    const data = readRecursos();
    //Extraiem l'id de l'url recordem que req es un objecte tipus requets
    // que conté l'atribut params i el podem consultar
    const id = parseInt(req.params.id);
    const recurs = data.recursos.find(r => r.id === id);

    if (!recurs) {
        return res.status(404).json({ message: "Recurso no encontrado" });
    }

    res.render("detallesRecursos", { recurs: recurs });
});

// Post recursos
router.post("/", (req, res) => {
    const data = readRecursos();
    const body = req.body;
    //todo lo que viene en ...body se agrega al nuevo libro, 
    //los (...) es un operador de propagación y sirve para hacer una copia de la información original
    const newRecurs = {
        id: data.recursos.length + 1,
        ...body,
    };
    data.recursos.push(newRecurs);
    writeRecursos(data);
    res.status(201).json(newRecurs);
});

// Update recursos
router.put("/:id", (req, res) => {
    const data = readRecursos();
    const body = req.body;
    const id = parseInt(req.params.id);
    const index = data.recursos.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Recurso no encontrado" });
    }

    data.recursos[index] = {
        ...data.recursos[index],
        ...body,
    };
    writeRecursos(data);
    res.redirect("/recursos");
});

// Delete recursos
router.delete("/:id", (req, res) => {
    const data = readRecursos();
    const id = parseInt(req.params.id);
    const index = data.recursos.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Recurso no encontrado" });
    }

    //splice esborra a partir de index, el número de elements
    // que li indiqui al segon argument, en aquest cas 1
    data.recursos.splice(index, 1);
    writeRecursos(data);
    res.json({ message: "Recurso eliminado correctamente" });
});

export default router;