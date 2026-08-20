import Link from "next/link";
import { artist } from "@/data/artist";
import { siteConfig } from "@/data/siteConfig";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-sand/60 bg-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="size-9 text-sm" />
            <p className="font-serif text-lg text-ink">Niharika Artist</p>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone">
            Original paintings, portraits and live art from Hyderabad, India —
            each piece made by hand, one story at a time.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium tracking-wide text-ink">Explore</p>
          <ul className="mt-3 space-y-2">
            {siteConfig.nav
              .filter((n) => n.href !== "/")
              .map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-sm text-stone hover:text-accent">
                    {n.label}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium tracking-wide text-ink">Get in touch</p>
          <ul className="mt-3 space-y-2 text-sm text-stone">
            <li>
              <a href={`mailto:${artist.email}`} className="hover:text-accent">
                {artist.email}
              </a>
            </li>
            <li>{artist.location}</li>
            <li className="flex gap-4 pt-1">
              <a
                href={artist.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                Instagram
              </a>
              <a
                href={artist.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent"
              >
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sand/60 px-5 py-5 text-center text-xs text-stone md:px-8">
        © {new Date().getFullYear()} Niharika Artist. All rights reserved.
      </div>
    </footer>
  );
}
