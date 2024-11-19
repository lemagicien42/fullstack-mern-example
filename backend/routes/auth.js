import express from "express";
import User from "../models/User.js";

import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { Resend } from "resend";

import jwt from "jsonwebtoken";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: "Invalid registration" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = Date.now() + 1000 * 60 * 60 * 24;

    const user = await User.create({
      email: email,
      password: hashedPassword,
      verificationToken: verificationToken,
      tokenExpiresAt: tokenExpiresAt,
    });

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: "Willkommen! Bitte E-Mail bestätigen",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7f7;">
        <h1 style="color: #333; text-align: center;">Welcome to d01b</h1>
        <p style="color: #666; line-height: 1.6;">We are happy to see u again</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">E-Mail bestätigen</a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">Next Step</p>
      </div>
    `,
    });

    if (emailResponse.error) {
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/verify/:token", async (req, res) => {
  const token = req.params.token;
  const user = await User.findOne({ verificationToken: token });

  if (user && Date.now() < user.tokenExpiresAt) {
    user.verified = true;

    user.verificationToken = undefined;
    user.tokenExpiresAt = undefined;

    await user.save();
    res.json({ message: "Your account has been successfully verified." });
  } else {
    res.status(400).json({
      error:
        "Invalid or expired token. Please request a new verification email.",
    });
  }
});
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: "Invalid login" });
  }

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ error: "Invalid login" });
    }

    if (!user.verified) {
      return res.status(403).json({ error: "Account not verified" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);

    if (!passwordCorrect) {
      return res.status(401).json({ error: "Invalid login" });
    }

    const token = jwt.sign({ userId: `89jkjk390` }, process.env.JWT_SECRET_KEY);
    res.json({
      user: user,
      token: token,
    });
    res.json({
      status: "success",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
