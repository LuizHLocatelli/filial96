
import { useState } from "react";
import { Note } from "./types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTheme } from "@/contexts/ThemeContext";

interface StickyNoteItemProps {
  note: Note;
  onDelete: (noteId: string) => void;
}

export function StickyNoteItem({ note, onDelete }: StickyNoteItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();

  // Cores para os sticky notes
  const colors = [
    { bg: isDarkMode ? 'bg-yellow-900/40' : 'bg-yellow-100', text: isDarkMode ? 'text-yellow-300' : 'text-yellow-800' },
    { bg: isDarkMode ? 'bg-blue-900/40' : 'bg-blue-100', text: isDarkMode ? 'text-blue-300' : 'text-blue-800' },
    { bg: isDarkMode ? 'bg-green-900/40' : 'bg-green-100', text: isDarkMode ? 'text-green-300' : 'text-green-800' },
    { bg: isDarkMode ? 'bg-purple-900/40' : 'bg-purple-100', text: isDarkMode ? 'text-purple-300' : 'text-purple-800' },
    { bg: isDarkMode ? 'bg-pink-900/40' : 'bg-pink-100', text: isDarkMode ? 'text-pink-300' : 'text-pink-800' }
  ];

  // Obter cor do note - usa a posição do note mod número de cores disponíveis
  const colorIndex = Math.abs(parseInt(note.id.slice(-2), 16)) % colors.length;
  const color = colors[colorIndex];

  return (
    <div
      className={`p-4 rounded-lg shadow-sm ${color.bg} ${color.text} min-h-[150px] flex flex-col ${
        isDarkMode ? 'border border-gray-700' : ''
      } transition-transform ${isHovered ? 'scale-105' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{note.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
            <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-700' : ''} />
            <DropdownMenuItem
              onClick={() => onDelete(note.id)}
              className={`text-red-600 ${isDarkMode ? 'hover:bg-gray-700 text-red-400' : ''}`}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 whitespace-pre-line break-words text-sm">
        {note.content}
      </div>
      <div className="text-xs mt-2 opacity-70 text-right">
        {note.created_at && format(new Date(note.created_at), "dd MMM. yyyy", { locale: ptBR })}
      </div>
    </div>
  );
}
