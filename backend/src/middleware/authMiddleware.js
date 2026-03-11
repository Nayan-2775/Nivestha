import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {

 try {

  const authHeader = req.headers.authorization;

  if (!authHeader)
   return res.status(401).json({
    message: "Token required",
   });

  if (!authHeader.startsWith("Bearer "))
   return res.status(401).json({
    message: "Invalid token",
   });

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);

  req.user = decoded;

  next();

 } catch {

  return res.status(401).json({
   message: "Unauthorized",
  });

 }

};