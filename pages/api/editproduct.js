// ✅ pages/api/editproduct.js
import { prisma } from "@/lib/prisma";
import formidable from "formidable";
import fs from "fs";
import path from "path";

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
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    allowEmptyFiles: false,
    filter: ({ originalFilename }) => Boolean(originalFilename && originalFilename.length > 0),
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    try {
      const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
      const description = Array.isArray(fields.description)
        ? fields.description[0]
        : fields.description;
      const price = parseFloat(
        Array.isArray(fields.price) ? fields.price[0] : fields.price
      );

      if (!id) return res.status(400).json({ error: "Product ID is required" });

      const existingProduct = await prisma.product.findUnique({ where: { id } });
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // ✅ Initialize imageUrl with existing one
      let imageUrl = existingProduct.imageUrl;

      const fileObj = Array.isArray(files.image) ? files.image[0] : files.image;

      // ✅ Only process if a new file was actually uploaded
      if (fileObj && fileObj.filepath && fs.existsSync(fileObj.filepath)) {
        // Delete old image if exists
        if (existingProduct.imageUrl) {
          const oldPath = path.join(process.cwd(), "public", existingProduct.imageUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }

        // Set new image path
        imageUrl = `/uploads/${path.basename(fileObj.filepath)}`;
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          title,
          description,
          price,
          imageUrl,
        },
      });

      return res.status(200).json({
        message: "✅ Product updated successfully",
        product: updatedProduct,
      });
    } catch (error) {
      console.error("Update error:", error);
      return res.status(500).json({ error: "Failed to update product" });
    }
  });
}
