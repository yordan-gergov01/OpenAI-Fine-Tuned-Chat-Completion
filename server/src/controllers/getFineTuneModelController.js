const fs = require('fs');
const path = require('path');

const OpenAI = require('openai');
const AppError = require('../utils/appError');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const outputDir = path.join(__dirname, '../models');
const outputFile = path.join(outputDir, 'models.json');

const getFineTuneModel = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return next(new AppError('JobID is required.', 400));
    }

    const job = await openai.fineTuning.jobs.retrieve(jobId);

    if (!job) {
      return next(new AppError('Job not found.', 404));
    }

    const fineTunedModel = job.fine_tuned_model;

    if (fineTunedModel) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      let existing = [];

      if (fs.existsSync(outputFile)) {
        const content = fs.readFileSync(outputFile, 'utf-8');
        existing = JSON.parse(content);
      }

      if (!existing.includes(fineTunedModel)) {
        existing.push(fineTunedModel);
        fs.writeFileSync(
          outputFile,
          JSON.stringify(existing, null, 2),
          'utf-8'
        );
      }
    }

    res.status(200).json({
      id: job.id,
      status: job.status,
      model: job.model,
      fine_tuned_model: job.fine_tuned_model,
    });
  } catch (error) {
    console.error('Error checking status and get fine-tuned model: ', error);
    return next(new AppError(error.message, error.status || 500));
  }
};

module.exports = getFineTuneModel;
