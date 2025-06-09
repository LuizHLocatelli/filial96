import { useState, useEffect, useMemo } from 'react';
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
  AlertCircle,
  User,
  ChevronDown,
  ChevronUp,
  Link2
} from 'lucide-react';
import { RotinaWithStatus, RotinaFormData } from '../types';
import { EditRotinaDialog } from './EditRotinaDialog';
import { ConexaoRotinaTarefa } from './ConexaoRotinaTarefa';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface RotinasListProps {
  rotinas: RotinaWithStatus[];
  isLoading: boolean;
  onToggleConclusao: (rotinaId: string, concluida: boolean) => Promise<boolean>;
  onEditRotina: (id: string, data: Partial<RotinaFormData>) => Promise<boolean>;
  onDeleteRotina: (id: string) => Promise<boolean>;
  onDuplicateRotina: (rotina: RotinaWithStatus) => Promise<boolean>;
  getCachedUserName?: (userId: string) => Promise<string>;
  onCreateTarefa?: (rotinaId: string) => void;
  onViewTarefa?: (tarefaId: string) => void;
}

interface RotinaWithCreator extends RotinaWithStatus {
  criador_nome?: string;
}

export function RotinasList({
  rotinas,
  isLoading,
  onToggleConclusao,
  onEditRotina,
  onDeleteRotina,
  onDuplicateRotina,
  getCachedUserName,
  onCreateTarefa,
  onViewTarefa
}: RotinasListProps) {
  const isMobile = useIsMobile();
  const [editingRotina, setEditingRotina] = useState<RotinaWithStatus | null>(null);
  const [rotinasWithCreators, setRotinasWithCreators] = useState<RotinaWithCreator[]>([]);
  const [loadingCheckboxes, setLoadingCheckboxes] = useState<Set<string>>(new Set());
  const [recentlyClicked, setRecentlyClicked] = useState<Set<string>>(new Set());
  const [expandedRotinas, setExpandedRotinas] = useState<Set<string>>(new Set());

  // Memoizar IDs de criadores únicos
  const creatorIds = useMemo(() => 
    [...new Set(rotinas.map(r => r.created_by))], 
    [rotinas]
  );

  useEffect(() => {
    const fetchCreatorNames = async () => {
      if (rotinas.length === 0) {
        setRotinasWithCreators([]);
        return;
      }

      if (getCachedUserName) {
        // Usar cache de usuários do hook principal
        const rotinasWithNames = await Promise.all(
          rotinas.map(async (rotina) => ({
            ...rotina,
            criador_nome: await getCachedUserName(rotina.created_by)
          }))
        );
        setRotinasWithCreators(rotinasWithNames);
      } else {
        // Fallback sem nomes
        setRotinasWithCreators(rotinas.map(rotina => ({
          ...rotina,
          criador_nome: 'Usuário'
        })));
      }
    };

    fetchCreatorNames();
  }, [rotinas, getCachedUserName]);

  // Memoizar funções de status
  const getStatusIcon = useMemo(() => (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'atrasada':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  }, []);

  const getStatusBadge = useMemo(() => (status: string) => {
    switch (status) {
      case 'concluida':
        return <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">Concluída</Badge>;
      case 'atrasada':
        return <Badge variant="outline" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">Atrasada</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 text-xs">Pendente</Badge>;
    }
  }, []);

  const getPeriodicidadeBadge = useMemo(() => (periodicidade: string) => {
    const colors = {
      diario: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      semanal: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
      mensal: 'bg-green-200/50 dark:bg-green-800/50 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600',
      personalizado: 'bg-green-300/50 dark:bg-green-700/50 text-green-950 dark:text-green-50 border-green-500 dark:border-green-500'
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
  }, []);

  const formatarDiaPreferencial = useMemo(() => (dia: string) => {
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
  }, []);

  const handleToggleConclusao = async (rotinaId: string, checked: boolean) => {
    // Prevenir cliques múltiplos muito rápidos
    if (recentlyClicked.has(rotinaId)) {
      return;
    }

    // Marcar como recentemente clicado
    setRecentlyClicked(prev => new Set(prev).add(rotinaId));
    
    // Remover da lista após 1 segundo
    setTimeout(() => {
      setRecentlyClicked(prev => {
        const newSet = new Set(prev);
        newSet.delete(rotinaId);
        return newSet;
      });
    }, 1000);
    
    // Adicionar ao conjunto de checkboxes em loading
    setLoadingCheckboxes(prev => new Set(prev).add(rotinaId));
    
    try {
      await onToggleConclusao(rotinaId, checked);
    } catch (error) {
      console.error('Erro no toggle:', error);
    } finally {
      // Remover do conjunto após completar
      setLoadingCheckboxes(prev => {
        const newSet = new Set(prev);
        newSet.delete(rotinaId);
        return newSet;
      });
    }
  };

  const toggleExpandRotina = (rotinaId: string) => {
    setExpandedRotinas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rotinaId)) {
        newSet.delete(rotinaId);
      } else {
        newSet.add(rotinaId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className={isMobile ? "p-3" : "p-4"}>
              <div className="flex items-center space-x-3">
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
            <div className="mx-auto w-12 h-12 bg-green-50 dark:bg-green-950/50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
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

  // Agrupar por categoria com memoização
  const rotinasPorCategoria = useMemo(() => {
    return rotinasWithCreators.reduce((acc, rotina) => {
      if (!acc[rotina.categoria]) {
        acc[rotina.categoria] = [];
      }
      acc[rotina.categoria].push(rotina);
      return acc;
    }, {} as Record<string, RotinaWithCreator[]>);
  }, [rotinasWithCreators]);

  return (
    <div className="space-y-6">
      {Object.entries(rotinasPorCategoria).map(([categoria, rotinasCategoria]) => (
        <div key={categoria} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold capitalize text-green-700 dark:text-green-300">
              {categoria}
            </h3>
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs">
              {rotinasCategoria.length}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {rotinasCategoria.map(rotina => (
              <Card 
                key={rotina.id} 
                className={cn(
                  "transition-all duration-200 hover:shadow-md border-border/50",
                  rotina.status === 'concluida' && "bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50",
                  rotina.status === 'atrasada' && "bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50"
                )}
              >
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  {/* Layout otimizado para mobile e desktop */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    
                    {/* Primeira linha: checkbox + conteúdo principal */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0 mt-0.5">
                        <Checkbox
                          checked={rotina.status === 'concluida'}
                          onCheckedChange={(checked) => {
                            handleToggleConclusao(rotina.id, checked as boolean);
                          }}
                          className="w-5 h-5"
                          disabled={loadingCheckboxes.has(rotina.id)}
                        />
                        {loadingCheckboxes.has(rotina.id) && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <h4 className={cn(
                          "font-medium text-sm sm:text-base transition-all duration-200 leading-snug",
                          rotina.status === 'concluida' && "line-through text-muted-foreground",
                          loadingCheckboxes.has(rotina.id) && "opacity-50"
                        )}>
                          {rotina.nome}
                        </h4>
                        
                        {rotina.descricao && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {rotina.descricao}
                          </p>
                        )}
                        
                        {/* Informações secundárias */}
                        <div className="flex flex-col gap-1">
                          {/* Criador */}
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              {rotina.criador_nome}
                            </span>
                          </div>
                          
                          {/* Dia e Horário */}
                          {rotina.dia_preferencial && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-green-600 flex-shrink-0" />
                              <span className="text-xs text-muted-foreground">
                                {formatarDiaPreferencial(rotina.dia_preferencial)}
                                {rotina.horario_preferencial && ` às ${rotina.horario_preferencial}`}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {getPeriodicidadeBadge(rotina.periodicidade)}
                          {getStatusBadge(rotina.status)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Ações - lado direito */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-shrink-0">
                      <div className="sm:hidden">
                        {getStatusIcon(rotina.status)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:block">
                          {getStatusIcon(rotina.status)}
                        </div>
                        
                        {/* Botão de expansão para tarefas */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandRotina(rotina.id)}
                          className={cn(
                            "p-0 hover:bg-green-100 dark:hover:bg-green-900/50",
                            isMobile ? "w-8 h-8" : "w-9 h-9"
                          )}
                          title="Ver tarefas relacionadas"
                        >
                          {expandedRotinas.has(rotina.id) ? (
                            <ChevronUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={cn(
                                "p-0 hover:bg-green-100 dark:hover:bg-green-900/50",
                                isMobile ? "w-8 h-8" : "w-9 h-9"
                              )}
                            >
                              <MoreVertical className="h-4 w-4 text-green-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => setEditingRotina(rotina)}>
                              <Edit2 className="h-4 w-4 mr-2 text-green-600" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicateRotina(rotina)}>
                              <Copy className="h-4 w-4 mr-2 text-green-600" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeleteRotina(rotina.id)}
                              className="text-red-600 focus:text-red-600"
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
                
                {/* Componente de conexão com tarefas - expandível */}
                {expandedRotinas.has(rotina.id) && (
                  <div className="px-4 pb-4">
                    <ConexaoRotinaTarefa
                      rotina={rotina}
                      onCreateTarefa={onCreateTarefa}
                      onViewTarefa={onViewTarefa}
                    />
                  </div>
                )}
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
