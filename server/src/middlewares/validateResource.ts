import { Response, Request, NextFunction } from "express";
import { AnyZodObject } from "zod";

const validateResource =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body, //allow us to create schemas where we can validate the body, query, and params.
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: any) {
      res.status(400).send(e.errors);
    }
  };

export default validateResource;
