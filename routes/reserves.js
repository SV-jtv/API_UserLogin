import express from 'express';
import fs from 'fs';

const router = express.Router();

const readReserves = () => {
    try {
        const data = fs.readFileSync("./data/reserves.json");
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
    }
};
const writeReserves = (data) => {
    try {
        fs.writeFileSync("./data/reserves.json", JSON.stringify(data));
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


//GET reserves
router.get('/', (req, res) => {
    const { user } = req.session
    const data = readReserves();
    res.render("reserves", { user, data})
    //res.json(data.reserves);
});

// Get reserves/:id
router.get("/:id", (req, res) => {
    const data = readReserves();
    //Extraiem l'id de l'url recordem que req es un objecte tipus requets
    // que conté l'atribut params i el podem consultar
    const id = parseInt(req.params.id);
    const reserva = data.reserves.find(r => r.id === id);

    if (!reserva) {
        return res.status(404).json({ message: "Recurso no encontrado" });
    }

    res.render("detallesReservas", { reserva: reserva });
});

// Post reserves
router.post("/", (req, res) => {
    const data = readReserves();
    const body = req.body;
    //todo lo que viene en ...body se agrega al nuevo libro, 
    //los (...) es un operador de propagación y sirve para hacer una copia de la información original
    const newRecurs = {
        id: data.reserves.length + 1,
        ...body,
    };
    data.reserves.push(newRecurs);
    writeReserves(data);
    res.status(201).json(newRecurs);
});

// Update reserves
router.put("/:id", (req, res) => {
    const data = readReserves();
    const body = req.body;
    const id = parseInt(req.params.id);
    const index = data.reserves.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Reserva no encontrada" });
    }

    data.reserves[index] = {
        ...data.reserves[index],
        ...body,
    };
    writeReserves(data);
    res.redirect("/reserves");
});

// Delete reserves
router.delete("/:id", (req, res) => {
    const data = readReserves();
    const id = parseInt(req.params.id);
    const index = data.reserves.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Reserva no encontrada" });
    }

    //splice esborra a partir de index, el número de elements
    // que li indiqui al segon argument, en aquest cas 1
    data.reserves.splice(index, 1);
    writeReserves(data);
    res.json({ message: "Reserva eliminada correctamente" });
});

export default router;