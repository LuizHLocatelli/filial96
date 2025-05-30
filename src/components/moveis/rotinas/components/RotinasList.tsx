
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
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluída</Badge>;
      case 'atrasada':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Atrasada</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pendente</Badge>;
    }
  };

  const getPeriodicidadeBadge = (periodicidade: string) => {
    const colors = {
      diario: 'bg-blue-50 text-blue-700 border-blue-200',
      semanal: 'bg-purple-50 text-purple-700 border-purple-200',
      mensal: 'bg-orange-50 text-orange-700 border-orange-200',
      personalizado: 'bg-pink-50 text-pink-700 border-pink-200'
    };

    const labels = {
      diario: 'Diário',
      semanal: 'Semanal',
      mensal: 'Mensal',
      personalizado: 'Personalizado'
    };

    return (
      <Badge variant="outline" className={colors[periodicidade as keyof typeof colors]}>
        {labels[periodicidade as keyof typeof labels]}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-gray-400" />
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
                  rotina.status === 'concluida' && "bg-green-50/50",
                  rotina.status === 'atrasada' && "bg-red-50/50"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <Checkbox
                        checked={rotina.status === 'concluida'}
                        onCheckedChange={(checked) => 
                          onToggleConclusao(rotina.id, checked as boolean)
                        }
                        className="w-5 h-5"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            "font-medium truncate",
                            rotina.status === 'concluida' && "line-through text-muted-foreground"
                          )}>
                            {rotina.nome}
                          </h4>
                          {getPeriodicidadeBadge(rotina.periodicidade)}
                          {getStatusBadge(rotina.status)}
                        </div>
                        
                        {rotina.descricao && (
                          <p className="text-sm text-muted-foreground truncate">
                            {rotina.descricao}
                          </p>
                        )}
                        
                        {rotina.horario_preferencial && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {rotina.horario_preferencial}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rotina.status)}
                      
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
