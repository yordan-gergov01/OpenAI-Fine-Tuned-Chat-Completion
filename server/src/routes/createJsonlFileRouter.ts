import express from "express";
import { createJsonl } from "../controllers/createJsonlController";

const createJsonlRouter = express.Router();

createJsonlRouter.post("/", createJsonl);

export default createJsonlRouter;
