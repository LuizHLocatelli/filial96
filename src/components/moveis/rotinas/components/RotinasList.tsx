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
  // 1. Hooks - All hooks must be called at the top level and in the same order on every render.
  const isMobile = useIsMobile();
  const [editingRotina, setEditingRotina] = useState<RotinaWithStatus | null>(null);
  const [rotinasWithCreators, setRotinasWithCreators] = useState<RotinaWithCreator[]>([]);
  const [loadingCheckboxes, setLoadingCheckboxes] = useState<Set<string>>(new Set());
  const [recentlyClicked, setRecentlyClicked] = useState<Set<string>>(new Set());
  const [expandedRotinas, setExpandedRotinas] = useState<Set<string>>(new Set());

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
        const rotinasWithNames = await Promise.all(
          rotinas.map(async (rotina) => ({
            ...rotina,
            criador_nome: await getCachedUserName(rotina.created_by)
          }))
        );
        setRotinasWithCreators(rotinasWithNames);
      } else {
        setRotinasWithCreators(rotinas.map(rotina => ({ ...rotina, criador_nome: 'Usuário' })));
      }
    };

    fetchCreatorNames();
  }, [rotinas, getCachedUserName]);

  const getStatusIcon = useMemo(() => (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'atrasada': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  }, []);

  const getStatusBadge = useMemo(() => (status: string) => {
    switch (status) {
      case 'concluida': return <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs">Concluída</Badge>;
      case 'atrasada': return <Badge variant="outline" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs">Atrasada</Badge>;
      default: return <Badge variant="outline" className="bg-gray-50 dark:bg-gray-950/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 text-xs">Pendente</Badge>;
    }
  }, []);

  const getPeriodicidadeBadge = useMemo(() => (periodicidade: string) => {
    const colors = {
      diario: 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      semanal: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
      mensal: 'bg-green-200/50 dark:bg-green-800/50 text-green-900 dark:text-green-100 border-green-400 dark:border-green-600',
      personalizado: 'bg-green-300/50 dark:bg-green-700/50 text-green-950 dark:text-green-50 border-green-500 dark:border-green-500'
    };
    const labels = { diario: 'Diário', semanal: 'Semanal', mensal: 'Mensal', personalizado: 'Personalizado' };
    return <Badge variant="outline" className={`${colors[periodicidade as keyof typeof colors]} text-xs`}>{labels[periodicidade as keyof typeof labels]}</Badge>;
  }, []);

  const formatarDiaPreferencial = useMemo(() => (dia: string) => {
    const dias = { 'segunda': 'Segunda-feira', 'terca': 'Terça-feira', 'quarta': 'Quarta-feira', 'quinta': 'Quinta-feira', 'sexta': 'Sexta-feira', 'sabado': 'Sábado', 'domingo': 'Domingo' };
    return dias[dia as keyof typeof dias] || dia;
  }, []);
  
  const rotinasPorCategoria = useMemo(() => {
    return rotinasWithCreators.reduce((acc, rotina) => {
      if (!acc[rotina.categoria]) {
        acc[rotina.categoria] = [];
      }
      acc[rotina.categoria].push(rotina);
      return acc;
    }, {} as Record<string, RotinaWithCreator[]>);
  }, [rotinasWithCreators]);

  // 2. Handlers
  const handleToggleConclusao = async (rotinaId: string, checked: boolean) => {
    if (recentlyClicked.has(rotinaId)) return;
    setRecentlyClicked(prev => new Set(prev).add(rotinaId));
    setTimeout(() => setRecentlyClicked(prev => { const newSet = new Set(prev); newSet.delete(rotinaId); return newSet; }), 1000);
    setLoadingCheckboxes(prev => new Set(prev).add(rotinaId));
    try {
      await onToggleConclusao(rotinaId, checked);
    } catch (error) {
      console.error('Erro no toggle:', error);
    } finally {
      setLoadingCheckboxes(prev => { const newSet = new Set(prev); newSet.delete(rotinaId); return newSet; });
    }
  };

  const toggleExpandRotina = (rotinaId: string) => {
    setExpandedRotinas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rotinaId)) newSet.delete(rotinaId);
      else newSet.add(rotinaId);
      return newSet;
    });
  };

  // 3. Conditional Returns - Must be AFTER all hooks.
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

  // 4. Main Return
  return (
    <div>
      {Object.entries(rotinasPorCategoria).map(([categoria, rotinasDaCategoria]) => (
        <div key={categoria} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 capitalize">
            {categoria}
          </h2>
          <div className="space-y-3">
            {rotinasDaCategoria.map((rotina) => (
              <Card 
                key={rotina.id}
                className={cn("transition-all duration-300 ease-in-out", { "bg-yellow-50 dark:bg-yellow-950/20": recentlyClicked.has(rotina.id) })}
              >
                <CardContent className={isMobile ? "p-3" : "p-4"}>
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`rotina-${rotina.id}`}
                      checked={rotina.status === 'concluida'}
                      onCheckedChange={(checked) => handleToggleConclusao(rotina.id, checked as boolean)}
                      disabled={loadingCheckboxes.has(rotina.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <label 
                            htmlFor={`rotina-${rotina.id}`}
                            className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
                          >
                            {rotina.nome}
                          </label>
                          {rotina.descricao && <p className="text-sm text-muted-foreground mt-1">{rotina.descricao}</p>}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => toggleExpandRotina(rotina.id)}>
                            {expandedRotinas.has(rotina.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingRotina(rotina)}><Edit2 className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDuplicateRotina(rotina)}><Copy className="mr-2 h-4 w-4" />Duplicar</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600 focus:text-red-600 dark:focus:text-red-500" onClick={() => onDeleteRotina(rotina.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {expandedRotinas.has(rotina.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">{getStatusIcon(rotina.status)}<span>{getStatusBadge(rotina.status)}</span></div>
                            <div className="flex items-center gap-2">{getPeriodicidadeBadge(rotina.periodicidade)}</div>
                            {rotina.periodicidade !== 'diario' && <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{formatarDiaPreferencial(rotina.dia_preferencial)}</span></div>}
                            {rotina.horario_preferencial && <div className="flex items-center gap-2"><Clock className="h-4 w-4" /><span>{rotina.horario_preferencial}</span></div>}
                            <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{rotina.criador_nome || 'Carregando...'}</span></div>
                          </div>
                          {rotina.gera_tarefa_automatica && (
                            <div className="mt-3">
                              <ConexaoRotinaTarefa rotina={rotina} onCreateTarefa={onCreateTarefa} onViewTarefa={onViewTarefa} />
                            </div>
                          )}
                        </div>
                      )}
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
          open={!!editingRotina}
          onOpenChange={(open) => !open && setEditingRotina(null)}
          rotina={editingRotina}
          onSubmit={async (data) => {
            const success = await onEditRotina(editingRotina.id, data);
            if (success) setEditingRotina(null);
            return success;
          }}
        />
      )}
    </div>
  );
}
