import express, { Request, Response } from "express";
import "dotenv/config";
const { Liquid } = require("liquidjs");
import path from "path";

require("dotenv").config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("public"));

const engine = new Liquid({
  root: __dirname, // for layouts and partials
  extname: ".liquid",
});

app.engine("liquid", engine.express()); // register liquid engine
app.set("views", [
  path.join(__dirname, "./views"),
  path.join(__dirname, "./partials"),
]); // specify the views directory

app.set("view engine", "liquid"); // set to default

app.get("/", (_req: Request, res: Response) => {
  const todos = ["fork and clone", "make it better", "make a pull request"];
  res.render("todolist", {
    todos: todos,
    title: "Welcome to liquidjs!",
  });
});

app.get("/ping", (_req: Request, res: Response) => {
  return res.send("pong 🏓");
});

app.listen(port, () => {
  return console.log(`Server is listening on ${port}`);
});
