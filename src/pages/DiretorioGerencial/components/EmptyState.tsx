import { memo } from "react";
import { motion } from "framer-motion";
import { FolderPlus, Upload, FileText, Search, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateType = "folders" | "files" | "search" | "pending" | "analyzed";

interface EmptyStateProps {
  type: EmptyStateType;
  searchQuery?: string;
  onCreateFolder?: () => void;
  onUpload?: () => void;
  className?: string;
}

const EMPTY_STATE_CONFIG: Record<
  EmptyStateType,
  { icon: React.ReactNode; title: string; description: string; action?: { label: string; icon: React.ReactNode } }
> = {
  folders: {
    icon: (
      <svg className="w-24 h-24 text-muted-foreground/30" viewBox="0 0 100 100" fill="none">
        <rect x="10" y="25" width="80" height="60" rx="8" stroke="currentColor" strokeWidth="2" />
        <path d="M10 35 L40 35 L50 25 L90 25 L90 75 L10 75 L10 35Z" stroke="currentColor" strokeWidth="2" fill="none" />
        <rect x="35" y="45" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    title: "Nenhuma pasta ainda",
    description: "Crie sua primeira pasta para começar a organizar seus documentos",
    action: { label: "Criar Pasta", icon: <FolderPlus className="w-4 h-4" /> },
  },
  files: {
    icon: (
      <svg className="w-24 h-24 text-muted-foreground/30" viewBox="0 0 100 100" fill="none">
        <path d="M20 10 L60 10 L80 30 L80 90 L20 90 Z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M60 10 L60 30 L80 30" stroke="currentColor" strokeWidth="2" />
        <line x1="30" y1="45" x2="70" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="55" x2="65" y2="55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="65" x2="55" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Nenhum arquivo aqui",
    description: "Arraste arquivos ou clique para fazer upload",
    action: { label: "Fazer Upload", icon: <Upload className="w-4 h-4" /> },
  },
  search: {
    icon: <Search className="w-16 h-16 text-muted-foreground/30" />,
    title: "Nenhum resultado encontrado",
    description: "Tente buscar com outros termos ou limpe o filtro",
  },
  pending: {
    icon: (
      <div className="relative">
        <FileText className="w-16 h-16 text-yellow-500/50" />
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
          <span className="text-[10px]">⏳</span>
        </div>
      </div>
    ),
    title: "Nenhum arquivo pendente",
    description: "Todos os arquivos já foram analisados pela IA",
  },
  analyzed: {
    icon: (
      <div className="relative">
        <Bot className="w-16 h-16 text-green-500/50" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-xs">✓</span>
        </div>
      </div>
    ),
    title: "Nenhum arquivo analisado",
    description: "Arquivos processados pela IA aparecerão aqui",
  },
};

export const EmptyState = memo(function EmptyState({
  type,
  searchQuery,
  onCreateFolder,
  onUpload,
  className,
}: EmptyStateProps) {
  const config = EMPTY_STATE_CONFIG[type];

  const handleAction = () => {
    if (type === "folders" && onCreateFolder) {
      onCreateFolder();
    } else if (type === "files" && onUpload) {
      onUpload();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        {config.icon}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-lg font-semibold text-foreground mb-2"
      >
        {searchQuery ? `Nenhum resultado para "${searchQuery}"` : config.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="text-sm text-muted-foreground max-w-sm mb-6"
      >
        {config.description}
      </motion.p>

      {config.action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Button onClick={handleAction} className="gap-2">
            {config.action.icon}
            {config.action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
});
