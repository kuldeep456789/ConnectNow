import { extractToken, verifyToken } from "../utils/auth.js";

export function authMiddleware(req, res, next) {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.userId = payload.userId;
  req.email = payload.email;

  next();
}

export function optionalAuthMiddleware(req, res, next) {
  const token = extractToken(req.headers.authorization);

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.userId = payload.userId;
      req.email = payload.email;
    }
  }

  next();
}
