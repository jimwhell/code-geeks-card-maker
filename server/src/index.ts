import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import logger from "./utils/logger";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

//Middlewares
app.use(express.json());
app.use(
  cors({
    exposedHeaders: ["x-access-token"],
  })
);

//route registration
routes(app);

//error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`App is listening at port: ${PORT}`);
});
