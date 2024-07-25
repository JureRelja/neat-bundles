"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const home_router_1 = __importDefault(require("./routes/home.router"));
require("dotenv").config();
const { Liquid } = require("liquidjs");
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
app.use(express_1.default.static("public"));
const engine = new Liquid({
    root: __dirname, // root for layouts and partials
    extname: ".liquid", // specify the extension of templates
});
app.engine("liquid", engine.express()); // register liquid engine
app.set("views", ["src/views", "src/partials"]); // specify the views directory
app.set("view engine", "liquid"); // set to default
//home route
app.use("/", home_router_1.default);
app.get("/api", (_req, res) => {
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