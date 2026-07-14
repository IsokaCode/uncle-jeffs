import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History & Heritage",
};

export default function HistoryPage() {
  return (
    <section className="history-page">
      <div className="history-content">
        <h1>History &amp; Heritage</h1>
        <div className="history-copy">
          <p>
            UNCLE JEFFS is a vintage focused archive rooted in the character
            and durability of authentic workwear. Drawing heavily from
            militaria and war-worn garments, the brand centers on pieces that
            were built for labor, utility, and survival. Shaped by factories,
            fields, and post-war Europe, each garment carries the marks of its
            past: softened fabrics, repaired seams, faded dyes, and details
            that speak to decades of use. UNCLE JEFFS isn&apos;t about just
            learning from history, but feeling it.
          </p>
          <p>
            To wear clothing that holds Function, Heritage and Life is a gift
            we are dedicated to share.
          </p>
        </div>
        <div className="history-tagline">
          <strong>STILL WORN</strong>
          <span>encore porté</span>
        </div>
      </div>
    </section>
  );
}
