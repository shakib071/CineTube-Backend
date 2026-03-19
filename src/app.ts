import express, { Application } from "express";


const app: Application = express();

app.get("/", (req, res) => {
    res.send("Hello, World from CineTube!");
});

export default app;
// changes for test