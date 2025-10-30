import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { PrismaClient } from "@prisma/client";
import LogoutButton from "./logout";
import styles from "@/styles/Dashboard.module.css";
import Link from "next/link";

const prisma = new PrismaClient();

export async function getServerSideProps({ req }) {
  const cookies = cookie.parse(req.headers?.cookie || "");
  const token = cookies.token || null;

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
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
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}

export default function Dashboard({ user, products }) {

  async function handleAddToCart(productId){
    await fetch('/api/cart/add',{
      method:"POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({productId})
    })
    alert("item added to cart!")
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h2 className={styles.logo}>E-Shop</h2>
        <div className={styles.navLinks}>
          <a href="/" className={styles.navBtn}>Home</a>
          <Link href='/cart'> 
            <button className={styles.navBtn}>Cart 🛒</button>
          </Link>
          <LogoutButton className={styles.navBtn} />
        </div>
      </nav>

      <h1 className={styles.welcome}>Welcome, {user.email}</h1>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} className={styles.card}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className={styles.productImage}
              />
            ) : (
              <div className={styles.noImage}>No Image</div>
            )}
            <h3 className={styles.title}>{product.title}</h3>
            <p className={styles.price}>₹{product.price}</p>
            <p className={styles.description}>{product.description}</p>
            <button className={styles.addToCartBtn} onClick={()=>handleAddToCart(product.id)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}
