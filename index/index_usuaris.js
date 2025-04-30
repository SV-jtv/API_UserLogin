import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const readData = () => {
    try {
        const data = fs.readFileSync("./data/index_usuaris.json");
        return JSON.parse(data);
    } catch (error) {
        console.error(error);
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync("./data/index_usuaris.json", JSON.stringify(data));
    } catch (error) {
        console.error(error);
    }
};

// ##################################################################################################################

// Post Usuaris
app.post("/usuaris", (req, res) => {
    const data = readData();
    const body = req.body;
    //todo lo que viene en ...body se agrega al nuevo libro, 
    //los (...) es un operador de propagación y sirve para hacer una copia de la información original
    const newBook = {
        id: data.books.length + 1,
        ...body,
    };
    data.books.push(newBook);
    writeData(data);
    res.json(newBook);
});

// Update Usuaris
app.put("/usuaris/:id", (req, res) => {
    const data = readData();
    const body = req.body;
    const id = parseInt(req.params.id);
    const bookIndex = data.books.findIndex((book) => book.id === id);
    data.books[bookIndex] = {
        ...data.books[bookIndex],
        ...body,
    };
    writeData(data);
    res.json({ message: "Book updated successfully" });
});

// Get Usuaris
app.get("/usuaris/:id", (req, res) => {
    const data = readData();
    //Extraiem l'id de l'url recordem que req es un objecte tipus requets
    // que conté l'atribut params i el podem consultar
    const id = parseInt(req.params.id);
    const book = data.books.find((book) => book.id === id);
    res.json(book);
});

// Delete Usuaris
//Creem un endpoint per eliminar un llibre
app.delete("/usuaris/:id", (req, res) => {
    const data = readData();
    const id = parseInt(req.params.id);
    const bookIndex = data.books.findIndex((book) => book.id === id);
    //splice esborra a partir de bookIndex, el número de elements
    // que li indiqui al segon argument, en aquest cas 1
    data.books.splice(bookIndex, 1);
    writeData(data);
    res.json({ message: "Book deleted successfully" });
});
// ##################################################################################################################

//Ultima línea simpre. Función para escuchar
app.listen(3000, () => {
    console.log("Server listing on port 3000")
});