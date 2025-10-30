import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { PrismaClient } from "@prisma/client";
import LogoutButton from "./logout";
import styles from "@/styles/cart.module.css";
import Link from "next/link";

const prisma = new PrismaClient();

export async function getServerSideProps({ req }) {
    const cookies = cookie.parse(req.headers.cookie || "");
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

        const cartItems = await prisma.cartItem.findMany({
            where: { userId: decoded.id },
            include: { product: true },
        });

        return {
            props: {
                cartItems: JSON.parse(JSON.stringify(cartItems)),
            },
        };
    } catch (err) {
        console.error(err);
        return {
            redirect: {
                destination: "/login",
                permanent: false,
            },
        };
    }
}

export default function CartPage({ cartItems }) {
    function countTotal(price, quantity) {
      if (!price || !quantity) return 0;
      return price * quantity;
    }
  
    return (
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>🛒 MyCart</div>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navBtn}>Home</Link>
            <LogoutButton />
          </div>
        </nav>
  
        <h1 className={styles.heading}>Your Cart</h1>
  
        {cartItems.length === 0 ? (
          <p className={styles.emptyCart}>Your cart is empty.</p>
        ) : (
          <div className={styles.cartGrid}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.card}>
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
  
                <div className={styles.cardContent}>
                  <h3 className={styles.title}>{item.product.title}</h3>
                  <p className={styles.price}>Price: ${item.product.price}</p>
                  <p className={styles.quantity}>Qty: {item.quantity}</p>
                  <p className={styles.Total}>
                    Total: ${countTotal(item.product.price, item.quantity).toFixed(2)}
                  </p>
                  <button className={styles.removeBtn}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  