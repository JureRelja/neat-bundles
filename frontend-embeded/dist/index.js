"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const { Liquid } = require("liquidjs");
require("dotenv").config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use(express_1.default.static("public"));
const engine = new Liquid({
    root: __dirname, // for layouts and partials
    extname: ".liquid",
});
app.engine("liquid", engine.express()); // register liquid engine
app.set("views", ["src/partials", "src/views"]); // specify the views directory
app.set("view engine", "liquid"); // set to default
app.get("/", (_req, res) => {
    const todos = ["fork and clone", "make it better", "make a pull request"];
    res.render("todolist", {
        todos: todos,
        title: "Welcome to liquidjs!",
    });
});
app.get("/ping", (_req, res) => {
    return res.send("pong 🏓");
});
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
//# sourceMappingURL=index.js.map