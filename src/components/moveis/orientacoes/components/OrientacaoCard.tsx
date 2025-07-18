import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image, 
  Download, 
  Eye, 
  Calendar,
  Edit2,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Orientacao } from "../types";
import { EditOrientacaoDialog } from "./EditOrientacaoDialog";
import { DeleteOrientacaoDialog } from "./DeleteOrientacaoDialog";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrientacaoCardProps {
  orientacao: Orientacao;
  onView: (orientacao: Orientacao) => void;
  onUpdate?: () => void;
}

export function OrientacaoCard({ orientacao, onView, onUpdate }: OrientacaoCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'vm': 'VM',
      'informativo': 'Informativo',
      'outro': 'Outro'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      'vm': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
              'informativo': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'outro': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800'
    };
    return colors[tipo as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes('image')) return Image;
    return FileText;
  };

  const handleSuccess = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const FileIcon = getFileIcon(orientacao.arquivo_tipo);

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border/40 group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileIcon className="h-4 w-4 text-primary" />
                </div>
                <Badge 
                  variant="outline" 
                  className={getTipoColor(orientacao.tipo)}
                >
                  {getTipoLabel(orientacao.tipo)}
                </Badge>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`touch-friendly p-0 transition-all duration-200 ${
                      isMobile 
                        ? 'opacity-100 hover:bg-muted/80 border border-border/50' 
                        : 'opacity-70 hover:opacity-100 group-hover:opacity-100 hover:bg-muted/60'
                    }`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Opções</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive dark:text-red-400 dark:focus:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <h3 className="font-semibold text-base line-clamp-2 text-foreground">
              {orientacao.titulo}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {orientacao.descricao}
            </p>
          </CardHeader>

          <CardContent className="flex-1 pb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(orientacao.data_criacao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="flex gap-2 w-full">
              <Button 
                onClick={() => onView(orientacao)}
                className="flex-1"
            variant="success"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(orientacao.arquivo_url, '_blank')}
                className="border-border/60 hover:border-border"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <EditOrientacaoDialog
        orientacao={orientacao}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={(data) => {
          // Handle save logic here
          console.log('Saving orientacao:', data);
          handleSuccess();
        }}
        isSubmitting={false}
        onSuccess={handleSuccess}
      />

      <DeleteOrientacaoDialog
        orientacao={orientacao}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onSuccess={handleSuccess}
      />
    </>
  );
}
