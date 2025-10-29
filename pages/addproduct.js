import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/addproduct.module.css";

export default function AddProduct() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      const res = await fetch("/api/addproduct", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Invalid input");
        return;
      }
      router.push("/admin");
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Add Your Product</h1>
        <p className={styles.subtitle}>Upload details to your store</p>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="title" className={styles.label}>Title</label>
            <input type="text" name="title" id="title" className={styles.input} placeholder="Enter product title" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea name="description" id="description" className={styles.textarea} placeholder="Enter product description"></textarea>
          </div>

          <div className={styles.field}>
            <label htmlFor="price" className={styles.label}>Price</label>
            <input type="number" step="0.01" name="price" id="price" className={styles.input} placeholder="Enter price" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="image" className={styles.label}>Image</label>
            <input type="file" name="image" id="image" accept="image/*" className={styles.input} />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
