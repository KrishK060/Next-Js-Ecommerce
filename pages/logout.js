import { useRouter } from "next/router";
import styles from "@/styles/logout.module.css";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button onClick={handleLogout} className={styles.logoutBtn}>
      Logout
    </button>
  );
}
