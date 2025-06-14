
import { UnifiedActivityTimeline } from '../UnifiedActivityTimeline';

interface AtividadesTabContentProps {
  rotinas: any[];
  tarefas: any[];
  isLoading: boolean;
  onStatusChange: (id: string, type: 'rotina' | 'tarefa', status: string) => Promise<void>;
  onEdit: (id: string, type: 'rotina' | 'tarefa') => void;
  onDelete: (id: string, type: 'rotina' | 'tarefa') => Promise<void>;
  onCreateRelated: (parentId: string, parentType: 'rotina' | 'tarefa', newType: 'rotina' | 'tarefa') => void;
  onCreateNew: (type: 'rotina' | 'tarefa') => void;
  getCachedUserName: (userId: string) => string;
  onAddTarefa: () => void;
}

export function AtividadesTabContent({
  rotinas,
  tarefas,
  isLoading,
  onStatusChange,
  onEdit,
  onDelete,
  onCreateRelated,
  onCreateNew,
  getCachedUserName,
  onAddTarefa
}: AtividadesTabContentProps) {
  return (
    <div className="bg-gradient-to-br from-background to-muted/20">
      <div className="p-4 sm:p-6">
        <UnifiedActivityTimeline
          rotinas={rotinas || []}
          tarefas={tarefas || []}
          isLoading={isLoading}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
          onDelete={onDelete}
          onCreateRelated={onCreateRelated}
          onCreateNew={onCreateNew}
          getCachedUserName={getCachedUserName}
          onAddTarefa={onAddTarefa}
        />
      </div>
    </div>
  );
}
