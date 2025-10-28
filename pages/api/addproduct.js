// pages/api/products.js
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Formidable error:", err);
      return res.status(500).json({ error: "File upload error" });
    }

    try {
      const { title, description, price } = fields;

      let imagePath = null;

      if (files.image) {
        const fileObj = Array.isArray(files.image) ? files.image[0] : files.image;
        if (fileObj && fileObj.filepath) {
          imagePath = `/uploads/${path.basename(fileObj.filepath)}`;
        }
      }

      const newProduct = await prisma.product.create({
        data: {
          title: String(title),
          description: String(description || ""),
          price: parseFloat(price),
          imageUrl: imagePath, 
        },
      });

      return res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
      });
    } catch (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database insert failed" });
    }
  });
}
