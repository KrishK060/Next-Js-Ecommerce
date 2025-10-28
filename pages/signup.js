import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/signup.module.css";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.message);
      return;
    }

    router.push("/login");
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🛍️</div>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Join the E-commerce Admin & User Portal</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>Full name</label>
            <input className={styles.input} type="text" name="name" placeholder="Enter your name" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input className={styles.input} type="email" name="email" placeholder="Enter your email" required />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input className={styles.input} type="password" name="password" placeholder="Create a password" required />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link className={styles.link} href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
