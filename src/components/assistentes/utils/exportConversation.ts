import jsPDF from "jspdf";
import type { AIChatMessage, AIAssistant, AIChatSession } from "../types";

function formatTimestamp(isoDate: string): string {
  return new Date(isoDate).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\.{2,}/g, ".")
    .substring(0, 100) || "conversa";
}

export function exportAsTxt(
  messages: AIChatMessage[],
  assistant: AIAssistant,
  session: AIChatSession
) {
  const lines: string[] = [
    `Conversa: ${session.title}`,
    `Assistente: ${assistant.name}`,
    `Exportado em: ${new Date().toLocaleString("pt-BR")}`,
    "─".repeat(50),
    "",
  ];

  for (const msg of messages) {
    const sender = msg.role === "user" ? "Você" : assistant.name;
    lines.push(`[${formatTimestamp(msg.created_at)}] ${sender}:`);
    lines.push(msg.content);
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(session.title || "conversa")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsPdf(
  messages: AIChatMessage[],
  assistant: AIAssistant,
  session: AIChatSession
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (requiredSpace: number) => {
    if (y + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(session.title || "Conversa", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Assistente: ${assistant.name}  •  ${new Date().toLocaleDateString("pt-BR")}`, margin, y);
  y += 10;
  doc.setTextColor(0);

  // Separator
  doc.setDrawColor(200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  for (const msg of messages) {
    const sender = msg.role === "user" ? "Você" : assistant.name;
    const time = formatTimestamp(msg.created_at);

    // Sender label
    addPageIfNeeded(12);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(msg.role === "user" ? 59 : 16, msg.role === "user" ? 130 : 185, msg.role === "user" ? 246 : 129);
    doc.text(`${sender}  ${time}`, margin, y);
    y += 5;

    // Message content
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(msg.content, maxWidth);
    for (const line of lines) {
      addPageIfNeeded(5);
      doc.text(line, margin, y);
      y += 5;
    }
    y += 4;
  }

  doc.save(`${sanitizeFilename(session.title || "conversa")}.pdf`);
}
