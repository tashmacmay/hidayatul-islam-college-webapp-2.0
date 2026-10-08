"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const heroImages = ["/images/HIC-kids.jpg", "/images/HIC-image2.jpg"];

export default function HomeHeroSlider() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[520px] overflow-hidden bg-navy text-white md:min-h-[600px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${heroImages[currentImage]}')`,
        }}
      />

      <div className="absolute inset-0 bg-navy/70" />

      <div className="relative z-10 flex min-h-[520px] items-center px-6 pt-24 pb-14 md:min-h-[600px] md:px-16 md:pt-28 md:pb-16">
        <div className="max-w-xl">
          <div className="mb-6 flex items-center gap-5">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-gold bg-white">
              <img src="/images/HIC_Logo2.png" alt="Hidayatul Islam College Logo" className="h-24 w-24 object-contain" />
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold leading-tight md:text-[28px]">
                Hidayatul Islam
                <span className="block text-gold">College</span>
              </h1>

              <p className="mt-2 text-sm font-medium text-gold">Knowledge is Light</p>
              <p
                dir="rtl"
                lang="ar"
                className="arabic-copy mt-1 text-lg text-gold/90"
              >
                النور هو المعرفة
              </p>
            </div>
          </div>

          <div className="mb-8 inline-block rounded-full border border-gold/40 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[2px] text-gold">
            Est. 1982 - Kensington, Cape Town
          </div>

          <h2 className="font-serif text-3xl font-bold leading-tight md:text-[42px]">
            Nurturing Minds,
            <span className="block text-gold">Illuminating Futures</span>
          </h2>

          <p className="mt-6 max-w-lg text-sm leading-7 text-blue-100">
            An independent community primary school rooted in Islamic values,
            dedicated to academic excellence and holistic development from
            Grade R to Grade 7.
          </p>

          <div className="mt-8 flex gap-4">
            <Link href="/about" className="button-primary">
              Explore Our School
            </Link>
            <Link href="/academics" className="button-secondary">
              Academics
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-6 z-20 flex gap-3 md:left-16">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`transition-all ${
              currentImage === index
                ? "h-3 w-8 rounded-full bg-gold"
                : "h-3 w-3 rounded-full bg-white/50 hover:bg-white"
            }`}
            aria-label={`Show hero image ${index + 1}`}
            aria-pressed={currentImage === index}
          />
        ))}
      </div>
    </section>
  );
}
