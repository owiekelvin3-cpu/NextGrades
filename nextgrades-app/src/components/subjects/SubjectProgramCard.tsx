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

/** Subject card — matches owner mockup (dark card, image, gold icon, dual CTAs). */
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
        "group flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#112240] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      <div className="relative">
        <div className="relative h-36 overflow-hidden sm:h-40">
          <MarketingImage
            src={imageSrc}
            fallbackSrc={imageFallback}
            alt=""
            containerClassName="h-full w-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 20vw, 240px"
            className="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div
          className="absolute -bottom-5 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-lg bg-[#D4AF37] shadow-lg"
          aria-hidden
        >
          <Icon className="h-5 w-5 text-[#0D1B2A]" strokeWidth={2} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-5 pt-9 sm:px-5 sm:pb-6">
        <h3 className="text-base font-bold leading-snug text-white sm:text-lg">{subject.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">{subject.description}</p>

        <ul className="mt-4 flex-1 space-y-2">
          {subject.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" strokeWidth={2} />
              <span className="leading-snug">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-5">
          <Link href="/consultation" className="btn-card-primary group">
            <span className="min-w-0 truncate pr-1">{bookTutoringLabel}</span>
            <span className="btn-card-primary-icon" aria-hidden>
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <button type="button" onClick={onViewMaterials} className="btn-card-secondary btn-card-secondary--navy">
            {viewMaterialsLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
