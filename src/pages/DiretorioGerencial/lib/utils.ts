import { type LucideIcon } from "lucide-react";
import {
  FileText,
  Image,
  FileSpreadsheet,
  File,
} from "lucide-react";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(
  type: string
): { icon: LucideIcon; color: string; label: string } {
  if (type.includes("pdf"))
    return { icon: FileText, color: "#ef4444", label: "PDF" };
  if (type.startsWith("image/"))
    return { icon: Image, color: "#3b82f6", label: "IMG" };
  if (type.includes("spreadsheet") || type.includes("excel"))
    return { icon: FileSpreadsheet, color: "#22c55e", label: "XLS" };
  return { icon: File, color: "#6b7280", label: "FILE" };
}

export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : "";
}

export function getFileNameWithoutExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
}

export function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function isAISupportedType(contentType: string): boolean {
  const supportedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
  ];
  return supportedTypes.includes(contentType);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function getItemCountText(
  subfoldersCount: number,
  filesCount: number
): string {
  const total = subfoldersCount + filesCount;
  if (total === 0) return "Pasta vazia";
  const folderText = pluralize(subfoldersCount, "1 subpasta", `${subfoldersCount} subpastas`);
  const fileText = pluralize(filesCount, "1 arquivo", `${filesCount} arquivos`);
  
  if (subfoldersCount === 0) return fileText;
  if (filesCount === 0) return folderText;
  return `${folderText}, ${fileText}`;
}
