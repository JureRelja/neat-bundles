import express, { Request, Response } from "express";
import path from "path";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  // Handle the GET request for the home route
  res.header("Content-Type", "application/liquid");
  res.render(path.join(process.cwd(), "src/views/home.liquid"), {
    name: "LiquidJS",
  });
});

export default router;
