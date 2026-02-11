import { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  StandardDialogHeader,
  StandardDialogContent,
  StandardDialogFooter,
} from '@/components/ui/standard-dialog';
import { FileUp, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useCurriculoOperations } from '../hooks/useCurriculoOperations';
import { useToast } from '@/hooks/use-toast';
import type { JobPosition } from '@/types/curriculos';
import { jobPositionLabels } from '@/types/curriculos';
import { cn } from '@/lib/utils';

interface UploadCurriculoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export function UploadCurriculoDialog({
  open,
  onOpenChange,
  onSuccess
}: UploadCurriculoDialogProps) {
  const [candidateName, setCandidateName] = useState('');
  const [jobPosition, setJobPosition] = useState<JobPosition | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { uploadCurriculo, isUploading, validateFile } = useCurriculoOperations();
  const { toast } = useToast();

  const resetForm = useCallback(() => {
    setCandidateName('');
    setJobPosition('');
    setFile(null);
    setIsDragging(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  }, [isUploading, onOpenChange, resetForm]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      toast({
        title: 'Arquivo inválido',
        description: error,
        variant: 'destructive'
      });
      return;
    }
    setFile(selectedFile);
  }, [validateFile, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!candidateName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe o nome do candidato',
        variant: 'destructive'
      });
      return;
    }

    if (!jobPosition) {
      toast({
        title: 'Vaga obrigatória',
        description: 'Selecione a vaga pretendida',
        variant: 'destructive'
      });
      return;
    }

    if (!file) {
      toast({
        title: 'Arquivo obrigatório',
        description: 'Selecione o arquivo do currículo',
        variant: 'destructive'
      });
      return;
    }

    const result = await uploadCurriculo({
      candidate_name: candidateName,
      job_position: jobPosition,
      file
    });

    if (result.success) {
      toast({
        title: 'Currículo cadastrado',
        description: 'O currículo foi salvo com sucesso'
      });
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } else {
      toast({
        title: 'Erro ao cadastrar',
        description: result.error || 'Ocorreu um erro ao salvar o currículo',
        variant: 'destructive'
      });
    }
  }, [candidateName, jobPosition, file, uploadCurriculo, toast, resetForm, onOpenChange, onSuccess]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden" hideCloseButton>
        <StandardDialogHeader
          icon={FileUp}
          iconColor="primary"
          title="Novo Currículo"
          description="Cadastre um novo currículo para a vaga"
          onClose={handleClose}
          loading={isUploading}
        />

        <StandardDialogContent className="space-y-4">
          {/* Candidate Name */}
          <div className="space-y-2">
            <Label htmlFor="candidate-name">
              Nome do Candidato <span className="text-red-500">*</span>
            </Label>
            <Input
              id="candidate-name"
              placeholder="Digite o nome completo"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* Job Position */}
          <div className="space-y-2">
            <Label htmlFor="job-position">
              Vaga Pretendida <span className="text-red-500">*</span>
            </Label>
            <Select
              value={jobPosition}
              onValueChange={(value) => setJobPosition(value as JobPosition)}
              disabled={isUploading}
            >
              <SelectTrigger id="job-position">
                <SelectValue placeholder="Selecione a vaga" />
              </SelectTrigger>
              <SelectContent>
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              Arquivo do Currículo <span className="text-red-500">*</span>
            </Label>
            
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                )}
              >
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileSelect(selectedFile);
                  }}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    Clique para selecionar ou arraste o arquivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF ou imagem (JPG, PNG, WEBP) - Máx. 10MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                {file.type === 'application/pdf' ? (
                  <FileText className="h-8 w-8 text-red-500" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-blue-500" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </StandardDialogContent>

        <StandardDialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUploading || !candidateName.trim() || !jobPosition || !file}
          >
            {isUploading ? 'Salvando...' : 'Salvar Currículo'}
          </Button>
        </StandardDialogFooter>
      </DialogContent>
    </Dialog>
  );
}
