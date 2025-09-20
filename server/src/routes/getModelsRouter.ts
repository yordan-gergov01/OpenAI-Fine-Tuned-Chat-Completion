import express from "express";
import { getModels } from "../controllers/getModelsController";

const getModelsRouter = express.Router();

getModelsRouter.get("/", getModels);

export default getModelsRouter;
