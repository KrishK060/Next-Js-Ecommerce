import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      if (data.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }

    } catch (err) {
      console.error(err);
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🛍️</div>
        <h1 className={styles.title}>Sign in to your account</h1>
        <p className={styles.subtitle}>E-commerce Admin & User Portal</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email address</label>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className={styles.row}>
            <label className={styles.checkboxLabel}>
              <input type="checkbox" name="remember" />
              Remember me
            </label>
            <Link className={styles.link} href="#">Forgot your password?</Link>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.primaryBtn} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.footer}>
          Don’t have an account?{" "}
          <Link className={styles.link} href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
