import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, FileText } from 'lucide-react';
import { useCurriculos } from './hooks/useCurriculos';
import { CurriculosList } from './components/CurriculosList';
import { UploadCurriculoDialog } from './components/UploadCurriculoDialog';
import { CurriculoViewDialog } from './components/CurriculoViewDialog';
import { DeleteCurriculoDialog } from './components/DeleteCurriculoDialog';
import type { Curriculo, JobPosition } from '@/types/curriculos';
import { jobPositionLabels } from '@/types/curriculos';

export default function Curriculos() {
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | 'all'>('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [viewingCurriculo, setViewingCurriculo] = useState<Curriculo | null>(null);
  const [deletingCurriculo, setDeletingCurriculo] = useState<Curriculo | null>(null);

  const jobPositionFilter = selectedPosition === 'all' ? null : selectedPosition;
  const { curriculos, isLoading, refetch } = useCurriculos(jobPositionFilter);

  const handleView = (curriculo: Curriculo) => {
    setViewingCurriculo(curriculo);
  };

  const handleDelete = (curriculo: Curriculo) => {
    setDeletingCurriculo(curriculo);
  };

  const handleDeleteSuccess = () => {
    setDeletingCurriculo(null);
    refetch();
  };

  return (
    <PageLayout>
      <PageHeader
        title="Currículos"
        description="Gerencie os currículos recebidos para as vagas disponíveis"
        icon={FileText}
        iconColor="text-blue-600"
        breadcrumbs={[
          { label: 'Hub', href: '/' },
          { label: 'Currículos' }
        ]}
      />

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Select
            value={selectedPosition}
            onValueChange={(value) => setSelectedPosition(value as JobPosition | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[280px]">
              <SelectValue placeholder="Filtrar por vaga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as vagas</SelectItem>
              <SelectItem value="crediarista">
                {jobPositionLabels.crediarista}
              </SelectItem>
              <SelectItem value="consultora_moda">
                {jobPositionLabels.consultora_moda}
              </SelectItem>
              <SelectItem value="consultor_moveis">
                {jobPositionLabels.consultor_moveis}
              </SelectItem>
              <SelectItem value="jovem_aprendiz">
                {jobPositionLabels.jovem_aprendiz}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Currículo
        </Button>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="mb-6 text-sm text-muted-foreground">
          {curriculos.length} currículo{curriculos.length !== 1 ? 's' : ''} encontrado
          {curriculos.length !== 1 ? 's' : ''}
          {selectedPosition !== 'all' && (
            <>
              {' '}para <span className="font-medium">
                {jobPositionLabels[selectedPosition]}
              </span>
            </>
          )}
        </div>
      )}

      {/* List */}
      <CurriculosList
        curriculos={curriculos}
        onView={handleView}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Dialogs */}
      <UploadCurriculoDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onSuccess={refetch}
      />

      <CurriculoViewDialog
        curriculo={viewingCurriculo}
        open={!!viewingCurriculo}
        onOpenChange={(open) => !open && setViewingCurriculo(null)}
      />

      <DeleteCurriculoDialog
        curriculo={deletingCurriculo}
        open={!!deletingCurriculo}
        onOpenChange={(open) => !open && setDeletingCurriculo(null)}
        onSuccess={handleDeleteSuccess}
      />
    </PageLayout>
  );
}
