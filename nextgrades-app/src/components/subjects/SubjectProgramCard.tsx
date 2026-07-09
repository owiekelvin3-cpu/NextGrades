"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingImage } from "@/components/marketing/MarketingImage";
import { cn } from "@/lib/utils";

export type SubjectCardData = {
  id: string;
  title: string;
  description: string;
  features: string[];
};

type Props = {
  subject: SubjectCardData;
  imageSrc: string;
  imageFallback?: string;
  icon: LucideIcon;
  bookTutoringLabel: string;
  viewMaterialsLabel: string;
  onViewMaterials: () => void;
  className?: string;
};

/** Subject card - compact accent layout on mobile, image card on desktop. */
export function SubjectProgramCard({
  subject,
  imageSrc,
  imageFallback,
  icon: Icon,
  bookTutoringLabel,
  viewMaterialsLabel,
  onViewMaterials,
  className,
}: Props) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 md:rounded-xl md:bg-[#112240] md:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {/* Subject photo header */}
      <div className="relative">
        <div className="relative h-36 overflow-hidden sm:h-40">
          <MarketingImage
            src={imageSrc}
            fallbackSrc={imageFallback}
            alt={subject.title}
            containerClassName="h-full w-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 20vw, 240px"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#112240]/80 via-transparent to-transparent" />
        </div>
        <div
          className="absolute -bottom-5 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-lg bg-[#D4AF37] shadow-lg"
          aria-hidden
        >
          <Icon className="h-5 w-5 text-[#0D1B2A]" strokeWidth={2} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 md:px-5 md:pb-6 md:pt-9">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug text-white md:text-lg md:font-bold">{subject.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-on-navy-subtle">{subject.description}</p>
        </div>

        <ul className="mt-4 flex-1 space-y-2 md:mt-4">
          {subject.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-on-navy-muted">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" strokeWidth={2} />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4 md:mt-5 md:flex-col md:gap-2.5 md:pt-5">
          <Link
            href="/consultation"
            className="btn-card-primary group min-h-10 flex-1 px-3 py-2 text-xs md:min-h-0 md:flex-none md:text-sm"
          >
            <span className="min-w-0 truncate pr-1">{bookTutoringLabel}</span>
            <span className="btn-card-primary-icon" aria-hidden>
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <button
            type="button"
            onClick={onViewMaterials}
            className="btn-card-secondary btn-card-secondary--on-dark min-h-10 flex-1 px-3 py-2 text-xs md:min-h-0 md:flex-none md:text-sm"
          >
            {viewMaterialsLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
