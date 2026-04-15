import { Request, Response, NextFunction } from "express";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = process.env.API_TOKEN ?? "";
  if (!token) {
    next();
    return;
  }

  const authHeader = req.headers["authorization"] ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (provided !== token) {
    res.status(401).json({
      error: {
        code: 401,
        message: "Invalid API key",
        metadata: null,
      },
      user_id: null,
    });
    return;
  }

  next();
}
