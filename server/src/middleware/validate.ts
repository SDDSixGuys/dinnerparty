import { type ZodSchema } from "zod";
import { type Request, type Response, type NextFunction } from "express";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request body";
      res.status(400).json({ error: message });
      return;
    }
    req.body = result.data;
    next();
  };
}
