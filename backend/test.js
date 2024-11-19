/*const date = Date.now() + 24 * 60 * 60 * 1000;
console.log(Date.now())
console.log(date)
console.log(Date.now() < date)
*/

// import bcrypt from "bcrypt";

// // $2b$10$mLUPXOc6qWmN9Zb2HH9lvuocMJO65.Yj8ZCZb2X5BSl6Rd6HpFD6q
// // $2b$10$v.lyccxiYrfPnZz/UKXy8.x/sD1IfSjRqymOKWPRLNmr2FElBLmF2

// const password = "katze1";

// const hashedPassword = await bcrypt.hash(password, 10);

// console.log(hashedPassword)

// const passwordCorrect = await bcrypt.compare("katze", hashedPassword);

// console.log(passwordCorrect);
//import crypto from "node:crypto";
//const token = crypto.randomBytes(32).toString(`hex`);
//console.log(token)
//const expirationDate = Date.now()+ 1000*60*60*24;
//console.log(expirationDate)
/*import { Resend } from 'resend';

const resend = new Resend('re_WAe7FxR3_NDBxaB3odKS7NvXzU3ry44nm');

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'totosuper40@gmail.com',
  subject: 'Hello World 1',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});*/
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
//const secret = crypto.randomBytes(32).toString(`hex`);
const payload = {userId:`89jkjk390`, email:"testa@gmail.com"}
//console.log(secret)
const token = jwt.sign({userId:`89jkjk390`}, process.env.JWT_SECRET_KEY);
const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY )
console.log( decoded)
///////////////////////////////////
app.get("/reports",authMiddleware,(req, res)=>{
  //console.log(req.user.userId)
res.send("test")
})
function authMiddleware(req, res, next){
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  
  try {
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY ) ; 
    req.user= decoded;
    next();
  } catch (error) {
    return res.status(401).send();
  }

  
}

/////////////////////////////////////////
import express from "express";
import User from "./models/User.js";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { Resend } from "resend";
import cors from 'cors';
import jwt from "jsonwebtoken";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);
router.post("/register", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    if (!email || !password) {
      return res.status(400).json({error: 'Invalid registration'});
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiresAt = Date.now() + 1000 * 60 * 60 * 24;
  
      const user = await User.create({
        email: email,
        password: hashedPassword,
        verificationToken: verificationToken,
        tokenExpiresAt: tokenExpiresAt
      })
  
      const emailResponse = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO,
        subject: 'Willkommen! Bitte E-Mail bestätigen',
        html:  `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
          <h1 style="color: #333; text-align: center;">Welcome to d01b</h1>
          <p style="color: #666; line-height: 1.6;">We are happy to see u again</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">E-Mail bestätigen</a>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">Next Step</p>
        </div>
      `
      });
  
      if (emailResponse.error) {
        return res.status(500).json({error: 'Failed to send verification email'})
      }
  
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({error: error.message})
    }
    
  })
  router.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    if (!email || !password) {
      return res.status(400).json({error: 'Invalid login'});
    }
  
    try {
      // TODO: checke erst ob Email korrekt
      const user = await User.findOne({email: email});
      if (!user) {
        return res.status(401).json({error: 'Invalid login'});
      }
  
      // check ob verified ist
      if (!user.verified) {
        return res.status(403).json({error: "Account not verified"});
      }
      const passwordCorrect = await bcrypt.compare(password, user.password);
  
      if (!passwordCorrect) {
        return res.status(401).json({error: 'Invalid login'});
      }
     
     
      const token = jwt.sign({userId:`89jkjk390`}, process.env.JWT_SECRET_KEY);
      res.json({
        
        user: user,
        token: token
      });
      res.json({
        status: "success",
        user: user
      });
    } catch (error) {
      res.status(500).json({error: error.message});
    }
    
  })
  router.get("/verify/:token", async (req, res) => {
    // hole Token aus URL
    // überprüfe ob Token in der users collection existiert
    const token = req.params.token;
    const user = await User.findOne({verificationToken: token});
  
    // check ob user gefunden und token noch gültig
    if (user && Date.now() < user.tokenExpiresAt) {
      // verified auf true setzen
      user.verified = true;
      // entferne die anderen Felder (nur benötigt wenn nicht verified)
      user.verificationToken = undefined;
      user.tokenExpiresAt = undefined;
      // speichere verändertes Objekt
      await user.save();
      res.json({"message": "Your account has been successfully verified."});
    } else {
      res.status(400).json({"error": "Invalid or expired token. Please request a new verification email."})
    }
  })
  
  export default router