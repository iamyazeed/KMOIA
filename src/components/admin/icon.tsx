import {
  Award,
  BarChart3,
  Building2,
  FolderOpen,
  HeartHandshake,
  History,
  Image as ImageIcon,
  Images,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  Library,
  Mail,
  MapPin,
  Milestone,
  Newspaper,
  QrCode,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wheat,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon registry.
 *
 * Navigation and content rows store an icon *name* in configuration or the
 * database, so a committee member can pick one without touching code. Mapping
 * names to components explicitly keeps tree-shaking intact — a dynamic import
 * of all of lucide would ship the entire icon set.
 */
const icons: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  image: ImageIcon,
  "bar-chart-3": BarChart3,
  "layout-template": LayoutTemplate,
  award: Award,
  library: Library,
  users: Users,
  "building-2": Building2,
  sparkles: Sparkles,
  milestone: Milestone,
  newspaper: Newspaper,
  images: Images,
  "folder-open": FolderOpen,
  "heart-handshake": HeartHandshake,
  "qr-code": QrCode,
  wheat: Wheat,
  inbox: Inbox,
  mail: Mail,
  "map-pin": MapPin,
  settings: Settings,
  shield: Shield,
  history: History,
};

export function AdminIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? LayoutDashboard;
  return <Icon className={className} aria-hidden />;
}
