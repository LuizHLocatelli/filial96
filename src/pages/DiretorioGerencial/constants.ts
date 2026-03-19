import { type LucideIcon } from "lucide-react";
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Star,
  Heart,
  Bookmark,
  Briefcase,
  Users,
  Settings,
  Home
} from "lucide-react";

export const FOLDER_COLORS = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#22c55e" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Roxo", value: "#a855f7" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Laranja", value: "#f97316" },
  { name: "Ciano", value: "#06b6d4" },
] as const;

export const FOLDER_ICONS: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "Pasta", icon: Folder, color: "#3b82f6" },
  { name: "Star", icon: Star, color: "#eab308" },
  { name: "Heart", icon: Heart, color: "#ef4444" },
  { name: "Bookmark", icon: Bookmark, color: "#a855f7" },
  { name: "Briefcase", icon: Briefcase, color: "#f97316" },
  { name: "Users", icon: Users, color: "#22c55e" },
  { name: "Settings", icon: Settings, color: "#6b7280" },
  { name: "Home", icon: Home, color: "#06b6d4" },
];

export const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
} as const;

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".png", ".jpg", ".jpeg", ".gif", ".webp",
  ".docx",
  ".xlsx",
];

export const STORAGE_BUCKET = "diretorio_gerencial";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const AI_SUPPORTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
