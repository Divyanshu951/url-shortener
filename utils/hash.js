import { createHmac, randomBytes } from "node:crypto";

export default function (salt = randomBytes(256).toString("hex"), password) {
  const hashedPassword = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  return { salt, hashedPassword };
}
