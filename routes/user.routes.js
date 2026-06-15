import express from "express";
import db from "../db/index.js";
import { userTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";
import {
  signupPostRequestSchema,
  loginPostRequestSchema,
} from "../validations/request.validation.js";
import hashPasswordWithSalt from "../utils/hash.js";
import { createUser, getUserByEmail } from "../services/user.service.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const validationResult = await signupPostRequestSchema.safeParseAsync(
    req.body,
  );

  if (!validationResult.success) {
    return res.status(400).json({
      success: false,
      errors: validationResult.error.format(),
    });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return res
      .status(400)
      .json({ error: `user with the email: ${email} already exists` });
  }

  const { salt, hashedPassword } = hashPasswordWithSalt(password);

  const user = await createUser(
    firstname,
    lastname,
    email,
    salt,
    hashedPassword,
  );

  res.json({ status: "user created successfully", userId: user.id });
});

router.post("/login", async (req, res) => {
  const validationResult = await loginPostRequestSchema.safeParseAsync(
    req.body,
  );

  if (!validationResult.success) {
    return res
      .status(400)
      .json({ Status: false, errors: validationResult.error.format() });
  }

  const { email, password } = validationResult.data;

  const user = await getUserByEmail(email);

  if (!user) res.status(400).json({ error: "User with email does not exist" });

  const hashed = hashPasswordWithSalt(user.salt, password);
  console.log(hashed);

  if (hashed.hashedPassword !== user.password)
    return res.status(400).json({ error: "Entered password is wrong!" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  res.json({ status: "Logged in successfully", token });
});

export default router;
