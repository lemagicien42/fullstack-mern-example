import jwt from "jsonwebtoken";



export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).send();
    }
  }