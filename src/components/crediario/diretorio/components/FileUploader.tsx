
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { DirectoryCategory } from '../types';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  categories: DirectoryCategory[];
  onUpload: (file: File, options: { 
    name?: string; 
    description?: string; 
    categoryId?: string; 
    isFeatured?: boolean;
  }) => Promise<any>;
  isUploading: boolean;
  progress?: number;
}

export function FileUploader({ categories, onUpload, isUploading, progress = 0 }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setUploadError(null);
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setUploadError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFileName('');
    setUploadError(null);
  };

  const validateFileSize = (file: File) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setUploadError(`O arquivo é muito grande. O limite é de 100MB.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Selecione um arquivo para fazer upload');
      return;
    }

    // Validar tamanho do arquivo
    if (!validateFileSize(file)) {
      return;
    }

    setUploadError(null);
    
    try {
      const result = await onUpload(file, {
        name: fileName || file.name,
        description: description || undefined,
        categoryId: categoryId || undefined,
        isFeatured
      });
      
      if (result) {
        // Upload bem-sucedido
        toast.success('Arquivo enviado com sucesso!');
        
        // Limpar o formulário após o upload bem-sucedido
        setFile(null);
        setFileName('');
        setDescription('');
        setCategoryId('');
        setIsFeatured(false);
      } else {
        // O upload falhou, mas o erro já foi tratado em onUpload
        console.log('Upload falhou, sem resultado retornado');
      }
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadError(error.message || 'Erro ao enviar o arquivo');
    }
  };

  // Determinar o tipo de arquivo para exibir o ícone apropriado
  const getFileTypeClass = (type?: string) => {
    if (!type) return 'bg-gray-200';
    
    if (type.includes('pdf')) return 'bg-red-100 text-red-700';
    if (type.includes('word') || type.includes('document')) return 'bg-blue-100 text-blue-700';
    if (type.includes('sheet') || type.includes('excel')) return 'bg-green-100 text-green-700';
    if (type.includes('image')) return 'bg-purple-100 text-purple-700';
    
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {!file ? (
            <div className="py-6">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Arraste e solte um arquivo aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Suporta PDF, Word, Excel, Imagens e outros formatos (máx. 100MB)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded ${getFileTypeClass(file.type)}`}>
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded border border-red-200">
            {uploadError}
          </div>
        )}

        {file && (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="file-name">Nome do arquivo</Label>
              <Input
                id="file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Nome do arquivo"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma descrição..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="featured">Destacar este arquivo</Label>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Enviando: {progress}%
                </p>
              </div>
            )}

            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? 'Enviando...' : 'Enviar arquivo'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
