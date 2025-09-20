# OpenAI Fine-Tuned Chat Completion

A full-stack web application for creating custom fine-tuned OpenAI models and interacting with them through a chat interface. Built with TypeScript, React, Node.js, Express, and the OpenAI API.

## Features

 Chat Interface

- Interactive chat completion with OpenAI models
- Support for streaming responses
- Configurable parameters (temperature, top-p, response count)
- Multiple message roles (system, user, assistant)
- Real-time model availability fetching

Fine-Tuning Capabilities

- Create custom training datasets with examples
- Upload training data in JSONL format to OpenAI
- Monitor fine-tuning job status in real-time
- Automatic model registration and availability
- Interactive training example management

Security & Performance

- Rate limiting (100 requests/hour)
- CORS protection
- Security headers with Helmet
- Global error handling
- Input validation and sanitization


<img width="1905" height="913" alt="Екранна снимка 2025-09-20 115648" src="https://github.com/user-attachments/assets/7d0c0ab9-f998-422b-b479-a3da2b7197db" />
<img width="1907" height="918" alt="Екранна снимка 2025-09-20 115602" src="https://github.com/user-attachments/assets/c79007d1-b615-470c-86d4-81c36666b4a3" />



## Tech Stack

Backend

- Node.js with Express.js
- TypeScript for type safety
- OpenAI API for model interactions
- Express middlewares: CORS, rate limiting, helmet

Frontend

- React + Vite with TypeScript
- React Hot Toast for notifications
- React Icons for UI elements
- React Tooltip for user guidance
- Tailwind CSS for styling


## Installation
Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key


## API Endpoints

Models

- GET /models - Fetch available OpenAI models and custom fine-tuned models
- GET /health - Health check endpoint

Fine-Tuning

- POST /upload - Upload training data and create fine-tuning job
- GET /fine-tune/:jobId - Get fine-tuning job status


## Usage


Chat Interface

- Select a model from the dropdown (includes fine-tuned models)
- Configure parameters like temperature and top-p
- Enter your message in the appropriate role field
- Click "Send Request" to get AI responses
- Enable streaming for real-time response generation

Fine-Tuning Process

- Switch to the "Fine-tuning" tab
- Select a base model (e.g., gpt-3.5-turbo)
- Add training examples with system, user, and assistant messages
- Ensure you have at least 10 training examples
- Submit for training and monitor the status
- Once completed, the new model will be available in the chat interface


## Training Data Format

The application expects training examples in the following format:

{

  "messages": [
  
    {"role": "system", "content": "You are a helpful assistant."},

    {"role": "user", "content": "What is the weather like?"},
    
    {"role": "assistant", "content": "I don't have access to real-time weather data. Please check a weather service for current conditions."}
    
  ]
  
}


## Error Handling

The application includes comprehensive error handling:

- Custom AppError class for operational errors
- Global error handler middleware
- Frontend error states and user notifications
- Graceful handling of OpenAI API errors
