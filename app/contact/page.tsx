import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="contact-content">
        <h1>Contact Us</h1>
        <ContactForm />
      </div>
    </section>
  );
}
