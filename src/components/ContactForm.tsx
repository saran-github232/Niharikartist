"use client";

import { useState, type FormEvent } from "react";
import { artist } from "@/data/artist";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }

    const subject = `Enquiry from ${name} via niharikartist.shop`;
    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href = `mailto:${artist.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setStatus("sent");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="text-sm text-stone">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="mt-1 w-full rounded-md border border-sand bg-ivory px-4 py-3 text-ink placeholder:text-stone/60 focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-sm text-stone">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="mt-1 w-full rounded-md border border-sand bg-ivory px-4 py-3 text-ink placeholder:text-stone/60 focus:border-accent"
        />
      </div>
      <div>
        <label htmlFor="message" className="text-sm text-stone">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project..."
          className="mt-1 w-full rounded-md border border-sand bg-ivory px-4 py-3 text-ink placeholder:text-stone/60 focus:border-accent"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-full bg-charcoal px-6 py-3 text-ivory transition-colors hover:bg-accent md:w-auto"
      >
        Send Message
      </button>

      {status === "sent" && (
        <p role="status" className="text-sm text-accent">
          Your email app should now be open with your message ready to send.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="text-sm text-red-700">
          Please fill in your name, a valid email, and a message.
        </p>
      )}
    </form>
  );
}
