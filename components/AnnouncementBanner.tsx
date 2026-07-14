const message =
  "FREE SHIPPING ON ORDERS OVER $300  ·  UNCLE JEFFS WORKWEAR AND MILITARIA  ·  ALL ORDERS ARE PROCESSED WITHIN 24/48 HOURS  ·  ";

export function AnnouncementBanner() {
  return (
    <div className="announcement-bar" aria-label="Store announcements">
      <div className="marquee-track">
        <span>{message}</span>
        <span aria-hidden="true">{message}</span>
      </div>
    </div>
  );
}
