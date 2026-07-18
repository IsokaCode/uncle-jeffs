"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/history", label: "History" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <nav className="site-nav">
      <div className="nav-inner">
        <Link href="/" className="nav-logo" aria-label="Uncle Jeff's home">
          <Image
            src="/logo/ujbw-logo.png"
            alt="Uncle Jeff's"
            width={68}
            height={68}
            priority
            unoptimized
          />
        </Link>

        <div className="nav-links" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                link.href === "/"
                  ? pathname === "/"
                    ? "page"
                    : undefined
                  : pathname.startsWith(link.href)
                    ? "page"
                    : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span />
            <span />
            <span />
            <span className="sr-only">Toggle menu</span>
          </button>
          <button
            type="button"
            className="cart-button"
            onClick={openCart}
            aria-label={`Open cart with ${itemCount} items`}
          >
            <Image
              src="/icons/Cart Icon.png"
              alt=""
              width={26}
              height={26}
            />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        className={`mobile-menu ${menuOpen ? "is-open" : ""}`}
      >
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
