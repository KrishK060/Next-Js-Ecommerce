import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import LogoutButton from "./logout";
import AddProduct from "./addproduct";
import Link from "next/link";

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
    return {
      props: { user: decoded },
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

export default function AdminDashboard({ user }) {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome Admin {user.email}</h1>
      <LogoutButton />

      <p>
        <Link href='/addproduct'>Add Product</Link>
      </p>
    </div>
  );
}

