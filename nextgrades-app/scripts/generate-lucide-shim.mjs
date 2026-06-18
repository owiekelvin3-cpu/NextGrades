import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {Record<string, string>} */
const LUCIDE_TO_FA = {
  Activity: "chartLine",
  AlertCircle: "circleExclamation",
  AlertTriangle: "triangleExclamation",
  Archive: "boxArchive",
  ArrowLeft: "arrowLeft",
  ArrowRight: "arrowRight",
  ArrowUp: "arrowUp",
  Atom: "atom",
  Award: "award",
  Ban: "ban",
  BarChart3: "chartColumn",
  Bell: "bell",
  BellRing: "bell",
  Bold: "bold",
  BookOpen: "bookOpen",
  Bookmark: "bookmark",
  BookmarkCheck: "bookmark",
  Bot: "robot",
  Brain: "brain",
  Briefcase: "briefcase",
  Calculator: "calculator",
  Calendar: "calendar",
  CalendarDays: "calendarDays",
  Camera: "camera",
  Check: "check",
  CheckCheck: "checkDouble",
  CheckCircle: "circleCheck",
  CheckCircle2: "circleCheck",
  ChevronDown: "chevronDown",
  ChevronLeft: "chevronLeft",
  ChevronRight: "chevronRight",
  ChevronUp: "chevronUp",
  ClipboardList: "clipboardList",
  Clock: "clock",
  CloudUpload: "cloudArrowUp",
  Construction: "helmetSafety",
  Cookie: "cookie",
  Copy: "copy",
  Cpu: "microchip",
  CreditCard: "creditCard",
  Crown: "crown",
  DollarSign: "dollarSign",
  Download: "download",
  Edit: "penToSquare",
  Euro: "euroSign",
  ExternalLink: "arrowUpRightFromSquare",
  Eye: "eye",
  EyeOff: "eyeSlash",
  File: "file",
  FileText: "fileLines",
  FileUp: "fileArrowUp",
  Film: "film",
  Filter: "filter",
  FlaskConical: "flask",
  Folder: "folder",
  FolderOpen: "folderOpen",
  Gauge: "gauge",
  Gift: "gift",
  Globe: "globe",
  GraduationCap: "graduationCap",
  GripVertical: "gripVertical",
  Heading2: "heading",
  Headphones: "headphones",
  Heart: "heart",
  HelpCircle: "circleQuestion",
  Hexagon: "drawPolygon",
  History: "clockRotateLeft",
  Home: "house",
  Image: "image",
  ImageIcon: "image",
  ImagePlus: "fileImage",
  Inbox: "inbox",
  Info: "circleInfo",
  Italic: "italic",
  KeyRound: "key",
  Languages: "language",
  Laptop: "laptop",
  Layers: "layerGroup",
  Layout: "tableCellsLarge",
  LayoutDashboard: "tableCellsLarge",
  LayoutGrid: "grip",
  LayoutList: "list",
  Leaf: "leaf",
  Library: "book",
  Lightbulb: "lightbulb",
  LineChart: "chartLine",
  Link2: "link",
  List: "list",
  ListChecks: "listCheck",
  ListOrdered: "listOl",
  Loader2: "spinner",
  Lock: "lock",
  LogIn: "rightToBracket",
  LogOut: "rightFromBracket",
  Mail: "envelope",
  MapPin: "locationDot",
  Maximize: "expand",
  Maximize2: "upRightAndDownLeftFromCenter",
  Megaphone: "bullhorn",
  Menu: "bars",
  MessageCircle: "comment",
  MessageSquare: "comment",
  MessageSquareQuote: "quoteLeft",
  Minimize: "compress",
  Monitor: "desktop",
  Moon: "moon",
  MoreHorizontal: "ellipsis",
  MousePointer2: "arrowPointer",
  Palette: "palette",
  PanelLeft: "columns",
  PanelLeftClose: "anglesLeft",
  Paperclip: "paperclip",
  Pause: "pause",
  PenTool: "pen",
  Pencil: "pencil",
  Phone: "phone",
  Pin: "thumbtack",
  Play: "play",
  Plus: "plus",
  Presentation: "chalkboard",
  Quote: "quoteLeft",
  Radio: "towerBroadcast",
  RefreshCw: "arrowsRotate",
  Rocket: "rocket",
  RotateCcw: "rotateLeft",
  Ruler: "ruler",
  Save: "floppyDisk",
  Scale: "scaleBalanced",
  School: "school",
  Search: "magnifyingGlass",
  Send: "paperPlane",
  Server: "server",
  Settings: "gear",
  Share2: "shareNodes",
  Shield: "shield",
  ShieldCheck: "shieldHalved",
  SlidersHorizontal: "sliders",
  Smartphone: "mobileScreen",
  Smile: "faceSmile",
  Sparkles: "wandMagicSparkles",
  Square: "square",
  Star: "star",
  Sun: "sun",
  Tablet: "tabletScreenButton",
  Tag: "tag",
  Target: "bullseye",
  Trash2: "trash",
  TrendingUp: "arrowTrendUp",
  Trophy: "trophy",
  Type: "font",
  UnderlineIcon: "underline",
  Unplug: "plugCircleXmark",
  Upload: "upload",
  UploadCloud: "cloudArrowUp",
  User: "user",
  UserCog: "userGear",
  UserRound: "user",
  Users: "users",
  Video: "video",
  Volume2: "volumeHigh",
  VolumeX: "volumeXmark",
  X: "xmark",
  XCircle: "circleXmark",
  Zap: "bolt",
};

const SPIN_ICONS = new Set(["Loader2"]);

const faNames = [...new Set(Object.values(LUCIDE_TO_FA))].sort();
const importList = faNames.map((n) => `fa${n.charAt(0).toUpperCase()}${n.slice(1)}`).join(", ");

const faVar = (name) => `fa${name.charAt(0).toUpperCase()}${name.slice(1)}`;

const exports = Object.entries(LUCIDE_TO_FA)
  .map(([lucide, fa]) => {
    const spin = SPIN_ICONS.has(lucide) ? ", { spin: true }" : "";
    return `export const ${lucide} = createFaIcon(${faVar(fa)}${spin});`;
  })
  .join("\n");

const content = `"use client";

/**
 * Font Awesome-backed drop-in for lucide-react (aliased in next.config / tsconfig).
 * Regenerate: node scripts/generate-lucide-shim.mjs
 */
import {
  ${importList},
} from "@fortawesome/free-solid-svg-icons";
import { createFaIcon, type LucideIcon, type LucideProps } from "./create-icon";

export type { LucideIcon, LucideProps };

${exports}
`;

const out = path.join(__dirname, "../src/lib/icons/lucide-react.tsx");
fs.writeFileSync(out, content);
console.log(`Wrote ${out} (${Object.keys(LUCIDE_TO_FA).length} icons)`);
