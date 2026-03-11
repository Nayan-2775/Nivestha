import jwt from "jsonwebtoken";

export const signToken = (payload) => {
 return jwt.sign(
  payload,
  process.env.JWT_SECRET,
  {
   expiresIn: process.env.JWT_EXPIRES_IN,
   algorithm: "HS256",
   issuer: "nivestha-api",
  }
 );
};


export const verifyToken = (token) => {
 return jwt.verify(
  token,
  process.env.JWT_SECRET,
  {
   algorithms: ["HS256"],
   issuer: "nivestha-api",
  }
 );
};