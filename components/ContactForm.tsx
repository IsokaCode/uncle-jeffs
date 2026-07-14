"use client";

import { FormEvent, useState } from "react";

type FormStatus = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_URL;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    if (!endpoint) {
      setStatus("error");
      return;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(event.currentTarget),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        event.currentTarget.reset();
        setStatus("success");
        return;
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Name
        <input type="text" name="name" required />
      </label>
      <label>
        Email
        <input type="email" name="email" required />
      </label>
      <label>
        Message
        <textarea name="message" required />
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
      </button>
      {status === "success" && (
        <p className="form-success">Message sent. We&apos;ll be in touch.</p>
      )}
      {status === "error" && (
        <p className="form-error">
          Message could not be sent. Check the Formspree configuration.
        </p>
      )}
    </form>
  );
}
