import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "./middlewares/cors";
import logger from "./utils/logger";
import errorHandler from "./middlewares/errorHandler";
import routes from "./routes";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { apphub_v1alpha } from "googleapis";

dotenv.config();

const app = express();

const PORT = Number(process.env.PORT) || 3000;

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("tiny"));
//Cors Configuration
app.use(cors);
//route registration
routes(app);

//error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`App is listening at port: ${PORT}`);
});
