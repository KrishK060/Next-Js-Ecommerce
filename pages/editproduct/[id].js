import { PrismaClient } from "@prisma/client";
import styles from "@/styles/addproduct.module.css";
import { useRouter } from "next/router";
import { useState } from "react";

const prisma = new PrismaClient();

export async function getServerSideProps({ params }) {
  const { id } = params;
  const product = await prisma.product.findUnique({
    where: { id },
  });

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  };
}

export default function EditProduct({ product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const res = await fetch("/api/editproduct", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Product updated successfully!");
      router.push("/admin"); // redirect back
    } else {
      alert( data.error);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Edit Product</h1>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
          <input type="hidden" name="id" value={product.id} />

          <label className={styles.label}>Title</label>
          <input name="title" defaultValue={product.title} className={styles.input} />

          <label className={styles.label}>Description</label>
          <textarea name="description" defaultValue={product.description} className={styles.textarea} />

          <label className={styles.label}>Price</label>
          <input name="price" type="number" defaultValue={product.price} className={styles.input} />

          <label className={styles.label}>Image</label>
          <input type="file" name="image" className={styles.input} />
          {product.imageUrl && (
            <img src={product.imageUrl} alt="Current product" className={styles.previewImage} />
          )}

          <button type="submit" disabled={loading} className={styles.primaryBtn}>
            {loading ? "Updating..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
