
import { Board } from "../types";
import { Button } from "@/components/ui/button";
import { CalendarDays, List, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageHeaderProps {
  title: string;
  description: string;
  board: Board;
  onAddTask: () => void;
}

export function PageHeader({ title, description, board, onAddTask }: PageHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="flex items-center gap-2 self-start">
        <Button 
          onClick={onAddTask} 
          size={isMobile ? "sm" : "default"}
          className="bg-brand-blue-600 hover:bg-brand-blue-700 text-white dark:bg-brand-blue-500 dark:hover:bg-brand-blue-600 dark:text-white shadow-md hover:shadow-lg transition-all flex gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Tarefa</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size={isMobile ? "sm" : "default"} className="hidden md:flex gap-1">
            <CalendarDays className="h-4 w-4" />
            <span>Calendário</span>
          </Button>
          
          <Button variant="outline" size={isMobile ? "sm" : "default"} className="hidden md:flex gap-1">
            <List className="h-4 w-4" />
            <span>Lista</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
