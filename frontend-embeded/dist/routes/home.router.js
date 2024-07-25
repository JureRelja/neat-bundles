"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
router.get("/", (req, res) => {
    // Handle the GET request for the home route
    console.log(req.query);
    console.log(req.body);
    res.header("Content-Type", "application/liquid");
    res.render(path_1.default.join(process.cwd(), "src/views/home.liquid"), {
        name: "LiquidJS",
    });
});
exports.default = router;
//# sourceMappingURL=home.router.js.map