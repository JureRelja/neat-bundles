import { LoopsClient } from "loops";

//Loops.io client for sending emails
const loops = new LoopsClient(process.env.LOOPS_API_KEY as string);

export const loopsClient = loops;
