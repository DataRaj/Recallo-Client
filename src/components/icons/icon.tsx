import type { LucideIcon } from 'lucide-react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Heart,
  Home,
  Info,
  Loader2,

  Mail,
  MapPin,
  Menu,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Trash,
  User,
  X,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  // Navigation
  home: Home,
  menu: Menu,
  close: X,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,

  // Actions
  search: Search,
  filter: Filter,
  plus: Plus,
  minus: Minus,
  edit: Edit,
  trash: Trash,
  check: Check,
  eye: Eye,
  eyeOff: EyeOff,

  // E-commerce
  shoppingCart: ShoppingCart,
  package: Package,
  creditCard: CreditCard,
  star: Star,
  heart: Heart,

  // User
  user: User,
  bell: Bell,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
  settings: Settings,

  // Status
  checkCircle: CheckCircle,
  alertCircle: AlertCircle,
  info: Info,
  spinner: Loader2,
} as const;
