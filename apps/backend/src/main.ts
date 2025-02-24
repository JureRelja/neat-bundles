import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { AppModule } from "./app.module";
import handlebars from "hbs";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from backend directory
config({ path: resolve(__dirname, "../.env") });

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useStaticAssets(join(__dirname, "..", "client/public"));
    app.setBaseViewsDir(join(__dirname, "..", "client/public/views"));
    app.setViewEngine("hbs");

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
    .then(() => {
        console.log("Server started at port " + (process.env.PORT ?? 3000));
    })
    .catch((err: unknown) => {
        console.error("Error starting server", err);
    });

//uncomment this line in production
// const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const BASE_URL: string = "https://context-prisoners-manufacturing-cyprus.trycloudflare.com";

// Register a Handlebars helper to make URLs absolute
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
handlebars.registerHelper("absoluteUrl", (path: string) => {
    if (path.startsWith("http") || path.startsWith("//")) {
        return path; // Already absolute
    }
    return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
});
