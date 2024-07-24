import express, { Request, Response } from "express";
import "dotenv/config";
import path from "path";
import home from "./routes/home";
require("dotenv").config();

const { Liquid } = require("liquidjs");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static("public"));

const engine = new Liquid({
  root: __dirname, // root for layouts and partials
  extname: ".liquid", // specify the extension of templates
});

app.engine("liquid", engine.express()); // register liquid engine
app.set("views", ["src/views", "src/partials"]); // specify the views directory

app.set("view engine", "liquid"); // set to default

app.use("/", home);

app.get("/api", (_req: Request, res: Response) => {
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
