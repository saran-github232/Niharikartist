import type { Metadata } from "next";
import { artist } from "@/data/artist";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import FadeImage from "@/components/FadeImage";
import NeonBorder from "@/components/originkit/ui/neon-border";

export const metadata: Metadata = {
  title: "About the Artist",
  description: `The story, philosophy and awards of ${artist.name}, artist based in ${artist.location}.`,
};

const bioParagraphs = artist.bio.split("\n").map((p) => p.trim()).filter(Boolean);
const values = [
  { title: "Creativity", body: "Pushing boundaries and exploring new artistic expressions." },
  { title: "Passion", body: "Every piece is created with love and dedication." },
  { title: "Excellence", body: "Striving for perfection in every brushstroke." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-16 md:px-8 md:pt-24">
        <SectionHeading
          eyebrow="About the Artist"
          title="My Story"
          description="An artist's journey through creativity, passion, and self-expression."
        />
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:pb-28">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden">
            <FadeImage
              src={artist.profileImage}
              alt={artist.name}
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              priority
              className="object-cover object-[center_75%]"
            />
          </div>
          <div className="pointer-events-none absolute inset-0">
            <NeonBorder color="#D9954A" rounded={0} thickness={3} borderSize={45} glow={65} speed={13} />
          </div>
        </Reveal>
        <Reveal delay={100} className="flex flex-col justify-center gap-4">
          <h1 className="font-serif text-2xl text-ink md:text-3xl">{artist.name}</h1>
          {bioParagraphs.map((p, i) => (
            <p key={i} className="leading-relaxed text-stone">
              {p}
            </p>
          ))}
        </Reveal>
      </section>

      <section className="bg-paper py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal>
            <SectionHeading eyebrow="Philosophy" title="What Drives Me" align="center" />
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80} className="text-center">
                <h3 className="font-serif text-lg text-ink">{v.title}</h3>
                <p className="mt-2 text-sm text-stone">{v.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionHeading eyebrow="Recognition" title="Awards" align="center" />
        </Reveal>
        <ul className="mt-10 space-y-6">
          {artist.awards.map((award, i) => (
            <Reveal key={i} delay={i * 80}>
              <li className="border-l-2 border-accent pl-5 text-stone">{award}</li>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
