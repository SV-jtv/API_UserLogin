import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const readData = () => {
    try {
        const data = fs.readFileSync("../data/recursos.json");
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync("../data/recursos.json", JSON.stringify(data));
    } catch (error) {
        console.error(error);
    }
};

// ##################################################################################################################

// Post Recursos
app.post("/recursos", (req, res) => {
    const data = readData();
    const body = req.body;
    //todo lo que viene en ...body se agrega al nuevo libro, 
    //los (...) es un operador de propagación y sirve para hacer una copia de la información original
    const newrecursIndex = {
        id: data.recursos.length + 1,
        ...body,
    };
    data.recursos.push(newrecursIndex);
    writeData(data);
    res.json(newrecursIndex);
});

// Update recursos
app.put("/recursos/:id", (req, res) => {
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const recursIndexIndex = data.recursos.findIndex((recursIndex) => recursIndex.id === id);
    data.recursos[recursIndexIndex] = {
        ...data.recursos[recursIndexIndex],
        ...body,
    };
    writeData(data);
    res.json({ message: "recursIndex updated successfully" });
});

// Get recursos
app.get("/recursos/:id", (req, res) => {
    const data = readData();
    //Extraiem l'id de l'url recordem que req es un objecte tipus requets
    // que conté l'atribut params i el podem consultar
    const id = parseInt(req.params.id);
    const recursIndex = data.recursos.find((recursIndex) => recursIndex.id === id);
    res.json(recursIndex);
});

// Delete recursos
//Creem un endpoint per eliminar un llibre
app.delete("/recursos/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const recursIndexIndex = data.recursos.findIndex((recursIndex) => recursIndex.id === id);
    //splice esborra a partir de recursIndexIndex, el número de elements
    // que li indiqui al segon argument, en aquest cas 1
    data.recursos.splice(recursIndexIndex, 1);
    writeData(data);
    res.json({ message: "recursIndex deleted successfully" });
});
// ##################################################################################################################

//Ultima línea simpre. Función para escuchar
app.listen(3000, () => {
    console.log("Server listing on port 3000")
});