"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _path = require("path");
const _appmodule = require("./app.module");
const _hbs = /*#__PURE__*/ _interop_require_default(require("hbs"));
const _dotenv = require("dotenv");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
// Load .env from backend directory
(0, _dotenv.config)({
    path: (0, _path.resolve)(__dirname, "../.env")
});
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    app.useStaticAssets((0, _path.join)(__dirname, "..", "client/public"));
    app.setBaseViewsDir((0, _path.join)(__dirname, "..", "client/public/views"));
    app.setViewEngine("hbs");
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap().then(()=>{
    console.log("Server started at port " + (process.env.PORT ?? 3000));
}).catch((err)=>{
    console.error("Error starting server", err);
});
//uncomment this line in production
// const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const BASE_URL = "https://context-prisoners-manufacturing-cyprus.trycloudflare.com";
// Register a Handlebars helper to make URLs absolute
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
_hbs.default.registerHelper("absoluteUrl", (path)=>{
    if (path.startsWith("http") || path.startsWith("//")) {
        return path; // Already absolute
    }
    return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
});

//# sourceMappingURL=main.js.map