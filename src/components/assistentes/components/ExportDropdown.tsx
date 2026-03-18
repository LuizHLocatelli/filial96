import { Download, FileText, FileDown } from "@/components/ui/emoji-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportAsPdf, exportAsTxt } from "../utils/exportConversation";
import type { AIChatMessage, AIAssistant, AIChatSession } from "../types";

interface ExportDropdownProps {
  messages: AIChatMessage[];
  assistant: AIAssistant;
  session: AIChatSession;
}

export function ExportDropdown({ messages, assistant, session }: ExportDropdownProps) {
  if (messages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0" title="Exportar conversa">
          <Download className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportAsPdf(messages, assistant, session)}>
          <FileDown className="w-4 h-4 mr-2" />
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportAsTxt(messages, assistant, session)}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar como TXT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
