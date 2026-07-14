import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <p>404</p>
      <h1>Garment not found.</h1>
      <Link href="/shop">RETURN TO SHOP</Link>
    </section>
  );
}
