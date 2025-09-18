import dotenv from "dotenv";
import { Server } from "http";

dotenv.config({ path: "./.env" });

import app from "./app";

// triggered when an exception occurs in synchronous code and is not handled by try...catch
process.on("uncaughtException", (err: Error) => {
  console.error(err.name, err.message);
  process.exit(1);
});

const PORT: number = parseInt(process.env.APP_PORT || "3000", 10);

const server: Server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started at port ${PORT}...`);
});

// triggered when there is a raw Promise rejection
process.on("unhandledRejection", (err: any) => {
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
