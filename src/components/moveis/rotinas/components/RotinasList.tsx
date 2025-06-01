import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Clock, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Copy,
  CheckCircle2,
  Circle,
  AlertCircle 
} from 'lucide-react';
import { RotinaWithStatus, RotinaFormData } from '../types';
import { EditRotinaDialog } from './EditRotinaDialog';
import { cn } from '@/lib/utils';

interface RotinasListProps {
  rotinas: RotinaWithStatus[];
  isLoading: boolean;
  onToggleConclusao: (rotinaId: string, concluida: boolean) => Promise<boolean>;
  onEditRotina: (id: string, data: Partial<RotinaFormData>) => Promise<boolean>;
  onDeleteRotina: (id: string) => Promise<boolean>;
  onDuplicateRotina: (rotina: RotinaWithStatus) => Promise<boolean>;
}

export function RotinasList({
  rotinas,
  isLoading,
  onToggleConclusao,
  onEditRotina,
  onDeleteRotina,
  onDuplicateRotina
}: RotinasListProps) {
  const [editingRotina, setEditingRotina] = useState<RotinaWithStatus | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'atrasada':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluida':
        return <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">Concluída</Badge>;
      case 'atrasada':
        return <Badge variant="outline" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">Atrasada</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 text-xs">Pendente</Badge>;
    }
  };

  const getPeriodicidadeBadge = (periodicidade: string) => {
    const colors = {
      diario: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      semanal: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      mensal: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      personalizado: 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800'
    };

    const labels = {
      diario: 'Diário',
      semanal: 'Semanal',
      mensal: 'Mensal',
      personalizado: 'Personalizado'
    };

    return (
      <Badge variant="outline" className={`${colors[periodicidade as keyof typeof colors]} text-xs`}>
        {labels[periodicidade as keyof typeof labels]}
      </Badge>
    );
  };

  const formatarDiaPreferencial = (dia: string) => {
    const dias = {
      'segunda': 'Segunda-feira',
      'terca': 'Terça-feira',
      'quarta': 'Quarta-feira',
      'quinta': 'Quinta-feira',
      'sexta': 'Sexta-feira',
      'sabado': 'Sábado',
      'domingo': 'Domingo'
    };
    return dias[dia as keyof typeof dias] || dia;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (rotinas.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Nenhuma rotina encontrada</h3>
              <p className="text-muted-foreground">
                Crie sua primeira rotina para começar a organizar suas tarefas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por categoria
  const rotinasPorCategoria = rotinas.reduce((acc, rotina) => {
    if (!acc[rotina.categoria]) {
      acc[rotina.categoria] = [];
    }
    acc[rotina.categoria].push(rotina);
    return acc;
  }, {} as Record<string, RotinaWithStatus[]>);

  return (
    <div className="space-y-6">
      {Object.entries(rotinasPorCategoria).map(([categoria, rotinasCategoria]) => (
        <div key={categoria} className="space-y-3">
          <h3 className="text-lg font-semibold capitalize">{categoria}</h3>
          
          <div className="space-y-2">
            {rotinasCategoria.map(rotina => (
              <Card 
                key={rotina.id} 
                className={cn(
                  "transition-all duration-200 hover:shadow-md",
                  rotina.status === 'concluida' && "bg-green-50/50 dark:bg-green-950/20",
                  rotina.status === 'atrasada' && "bg-red-50/50 dark:bg-red-950/20"
                )}
              >
                <CardContent className="p-3 sm:p-4">
                  {/* Layout mobile: stack vertical */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    
                    {/* Primeira linha: checkbox + título */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={rotina.status === 'concluida'}
                        onCheckedChange={(checked) => 
                          onToggleConclusao(rotina.id, checked as boolean)
                        }
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className={cn(
                          "font-medium text-sm sm:text-base",
                          rotina.status === 'concluida' && "line-through text-muted-foreground"
                        )}>
                          {rotina.nome}
                        </h4>
                        
                        {rotina.descricao && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {rotina.descricao}
                          </p>
                        )}
                        
                        {/* Dia e Horário */}
                        <div className="space-y-1">
                          {rotina.dia_preferencial && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">
                                {formatarDiaPreferencial(rotina.dia_preferencial)}
                                {rotina.horario_preferencial && ` às ${rotina.horario_preferencial}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Badges - sempre na linha inferior em mobile */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {getPeriodicidadeBadge(rotina.periodicidade)}
                          {getStatusBadge(rotina.status)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Ações - lado direito em desktop, linha separada em mobile */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 sm:flex-shrink-0">
                      <div className="sm:hidden">
                        {getStatusIcon(rotina.status)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                          {getStatusIcon(rotina.status)}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingRotina(rotina)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicateRotina(rotina)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeleteRotina(rotina.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {editingRotina && (
        <EditRotinaDialog
          rotina={editingRotina}
          open={!!editingRotina}
          onOpenChange={() => setEditingRotina(null)}
          onSubmit={async (data) => {
            const success = await onEditRotina(editingRotina.id, data);
            if (success) {
              setEditingRotina(null);
            }
            return success;
          }}
        />
      )}
    </div>
  );
}
