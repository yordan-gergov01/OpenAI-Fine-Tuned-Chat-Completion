import { Request, Response, NextFunction } from "express";
import { OpenAI } from "openai";

import AppError from "../utils/appError";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getModels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const models = await openai.models.list();

    const fineTunedCustomModels: string[] = models.data
      .filter(
        (model) =>
          !["openai", "openai-internal", "system"].includes(model.owned_by)
      )
      .filter((model) => !model.id.includes("ckpt-step"))
      .map((model) => model.id);

    const hasGPT35Turbo = models.data.some(
      (model) => model.id === "gpt-3.5-turbo"
    );

    if (hasGPT35Turbo) {
      fineTunedCustomModels.unshift("gpt-3.5-turbo");
    }

    res.status(200).json({
      status: "success",
      models: fineTunedCustomModels,
    });
  } catch (error: any) {
    console.error("Error fetching models from OpenAI: ", error);
    return next(new AppError(error.message, error.statusCode || 500));
  }
};
