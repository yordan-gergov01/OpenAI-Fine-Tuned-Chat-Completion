const fs = require('fs');
const path = require('path');
const AppError = require('../utils/appError');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const outputDir = path.join(__dirname, '../uploads');

const createJsonl = async (req, res, next) => {
  try {
    const { data, model = 'gpt-3.5-turbo' } = req.body;

    if (!Array.isArray(data) || !model) {
      return next(
        new AppError(
          'Invalid input format. Messages must be an array and model is required.',
          400
        )
      );
    }

    const jsonlContent = data.map((entry) => JSON.stringify(entry)).join('\n');

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const fileName = `training-${uuidv4()}.jsonl`;
    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(filePath, jsonlContent, 'utf-8');

    const file = await openai.files.create({
      file: fs.createReadStream(filePath),
      purpose: 'fine-tune',
    });

    let fileStatus = file.status;
    while (fileStatus !== 'processed') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const fetchedFile = await openai.files.retrieve(file.id);
      fileStatus = fetchedFile.status;
      if (fileStatus === 'failed') {
        throw new Error('File processing failed on OpenAI.');
      }
    }

    const fineTune = await openai.fineTuning.jobs.create({
      training_file: file.id,
      model,
    });

    res.status(200).json({
      status: 'success',
      message: 'Файлът беше създаден успешно!',
      fileId: file.id,
      jobId: fineTune.id,
    });
  } catch (error) {
    console.error(
      'Error with creating JSONL file or fine-tuning error: ',
      error
    );

    return next(new AppError(error.message, error.status || 500));
  }
};

module.exports = createJsonl;
