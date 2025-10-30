import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { productId } = req.body;

    const existing = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: 1 } },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId,
        },
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Error adding to cart:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}
