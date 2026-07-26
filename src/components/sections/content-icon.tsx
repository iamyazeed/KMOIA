import {
  Award,
  BookOpen,
  Box,
  Building2,
  Clapperboard,
  GraduationCap,
  Heart,
  Landmark,
  Languages,
  Laptop,
  LayoutTemplate,
  Library,
  Palette,
  Shield,
  Sparkles,
  Star,
  Users,
  Utensils,
  type LucideIcon,
} from "lucide-react";

/**
 * Icons available to content rows.
 *
 * Mapped explicitly rather than imported dynamically so tree-shaking still
 * works — a dynamic lookup across lucide would ship the entire icon set to
 * every visitor.
 */
const icons: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  heart: Heart,
  star: Star,
  award: Award,
  "graduation-cap": GraduationCap,
  utensils: Utensils,
  library: Library,
  laptop: Laptop,
  "layout-template": LayoutTemplate,
  "building-2": Building2,
  palette: Palette,
  clapperboard: Clapperboard,
  box: Box,
  shield: Shield,
  languages: Languages,
  sparkles: Sparkles,
  users: Users,
  landmark: Landmark,
};

export function ContentIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}
