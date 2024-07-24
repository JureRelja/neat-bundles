import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  // Handle the GET request for the home route
  res.send("Welcome to the home page!");
});

export default router;
