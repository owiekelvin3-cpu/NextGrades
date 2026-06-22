import { Card } from "./ui/Card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="group p-8 hover:border-soft-gold/30">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-soft-gold to-yellow-400 transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-7 w-7 text-deep-navy" />
      </div>
      <h3 className="mb-3 text-xl font-bold text-deep-navy">{title}</h3>
      <p className="leading-relaxed text-gray-600">{description}</p>
    </Card>
  );
}
