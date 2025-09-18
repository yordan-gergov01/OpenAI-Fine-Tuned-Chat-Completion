import fs from "fs";
import path from "path";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";

import AppError from "../utils/appError";
import { CreateJsonlBody } from "../types/interfaces";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const outputDir = path.join(__dirname, "../uploads");

export const createJsonl = async (
  req: Request<unknown, unknown, CreateJsonlBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, model = "gpt-3.5-turbo" } = req.body;

    if (!Array.isArray(data) || !model) {
      return next(
        new AppError(
          "Invalid input format. Messages must be an array and model is required.",
          400
        )
      );
    }

    const jsonlContent = data.map((entry) => JSON.stringify(entry)).join("\n");

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const fileName = `training-${uuidv4()}.jsonl`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, jsonlContent, "utf-8");

    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: "fine-tune",
    });

    let fileStatus = file.status;
    while (fileStatus !== "processed") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const fetchedFile = await openai.files.retrieve(file.id);
      fileStatus = fetchedFile.status;

      if (fileStatus === "error") {
        throw new Error("File processing failed on OpenAI.");
      }
    }

    const fineTune = await openai.fineTuning.jobs.create({
      training_file: file.id,
      model,
    });

    res.status(200).json({
      status: "success",
      message: "Файлът беше създаден успешно!",
      fileId: file.id,
      jobId: fineTune.id,
    });
  } catch (error: any) {
    console.error(
      "Error with creating JSONL file or fine-tuning error: ",
      error
    );

    return next(new AppError(error.message, error.statusCode || 500));
  }
};
