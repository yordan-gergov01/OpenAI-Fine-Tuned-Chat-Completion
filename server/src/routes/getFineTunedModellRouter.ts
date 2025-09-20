import express from "express";
import { getFineTuneModel } from "../controllers/getFineTuneModelController";

const getFineTuneRouter = express.Router();

getFineTuneRouter.get("/:jobId", getFineTuneModel);

export default getFineTuneRouter;
