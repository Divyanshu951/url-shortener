import express from "express";
import db from "../db/index.js";
import { userTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";
import { createHmac, randomBytes } from "node:crypto";
import { signupPostRequestSchema } from "../validations/request.validation.js";

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

  const [existingUser] = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, email));

  if (existingUser) {
    return res
      .status(400)
      .json({ error: `user with the email: ${email} already exists` });
  }

  const salt = randomBytes(256).toString("hex");

  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  const [user] = await db
    .insert(userTable)
    .values({
      firstname,
      lastname,
      email,
      salt,
      password: hashedPassword,
    })
    .returning({ id: userTable.id });

  res.json({ status: "user created successfully", userId: user.id });
});

export default router;
