import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import LogoutButton from "./logout";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import styles from "@/styles/AdminDashboard.module.css";

const prisma = new PrismaClient();

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers?.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return {
      props: {
        user: decoded,
        products: JSON.parse(JSON.stringify(products)),
      },
    };
  } catch (err) {
    console.error("JWT verification failed:", err);
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }
}

export default function AdminDashboard({ user, products }) {

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;
  
    const res = await fetch(`/api/deleteproduct/${id}`, { method: "DELETE" });
  
    if (res.ok) {
      alert("Product deleted successfully!");
      window.location.reload();
    } else {
      alert("Failed to delete product.");
    }
  }
  

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <h2 className={styles.logo}>🛍️ E-Commerce</h2>
        <nav>
          <ul>
            <li className={styles.active}>Dashboard</li>
            <li>Products</li>
            <li>Orders</li>
            <li>Customers</li>
            <li>Settings</li>
          </ul>
        </nav>
        <div className={styles.userBox}>
          <div>
            <p>{user.email}</p>
            <span>Administrator</span>
          </div>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Product Management</h1>
          <div>
            <Link href="/addproduct">
              <button className={styles.addBtn}>+ Add Product</button>
            </Link>
            <LogoutButton />
          </div>
        </header>

        
        <section className={styles.tableSection}>
          <h2 className={styles.sectionTitle}>Products</h2>
          {products.length === 0 ? (
            <p className={styles.noProducts}>No products found.</p>
          ) : (
            <table className={styles.productTable}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price (₹)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className={styles.productImage}
                        />
                      ) : (
                        <span className={styles.noImage}>No Image</span>
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td>{product.description}</td>
                    <td>{product.price}</td>
                    <td className={styles.actionBtns}>
                    <Link href={`/editproduct/${product.id}`}>
                      <button className={styles.editBtn}>Edit</button>
                    </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
