import { Card } from "./ui/Card";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  delay?: number;
}

export function TestimonialCard({ quote, name, role, avatar, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-8">
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-5 h-5 fill-soft-gold text-soft-gold" />
          ))}
        </div>
        <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-navy to-soft-gold flex items-center justify-center text-white font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-deep-navy">{name}</p>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
