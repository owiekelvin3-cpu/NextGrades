import { Card } from "./ui/Card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  delay?: number;
}

export function TestimonialCard({ quote, name, role }: TestimonialCardProps) {
  return (
    <Card className="p-8">
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className="h-5 w-5 fill-soft-gold text-soft-gold" />
        ))}
      </div>
      <p className="mb-6 leading-relaxed text-gray-700">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-deep-navy to-soft-gold text-sm font-bold text-white">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-deep-navy">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </Card>
  );
}
