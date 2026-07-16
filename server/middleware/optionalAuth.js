import jwt from "jsonwebtoken";

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
  } catch (err) {
    // Token invalide/expiré : on continue sans utilisateur identifié.
  }

  next();
}
