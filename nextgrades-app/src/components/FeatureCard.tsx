import { Card } from "./ui/Card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-8 hover:border-soft-gold/30 group">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-soft-gold to-yellow-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-deep-navy" />
        </div>
        <h3 className="text-xl font-bold text-deep-navy mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  );
}
