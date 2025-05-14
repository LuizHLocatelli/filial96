
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UploadCloud, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DirectoryCategory } from '../types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setUploadError("File size cannot exceed 10MB.");
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho do arquivo não pode exceder 10MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    setUploadError(null);
    
    if (!selectedFile) {
      setUploadError("Nenhum arquivo selecionado");
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await onUpload(selectedFile, {
        name: fileName || selectedFile.name,
        description,
        categoryId: categoryId || undefined,
        isFeatured
      });
      
      if (success) {
        setSelectedFile(null);
        setFileName('');
        setDescription('');
        setCategoryId('');
        setIsFeatured(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error: any) {
      console.error("Error during upload:", error);
      setUploadError(error.message || "Erro ao enviar arquivo. Tente novamente.");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFileName('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {uploadError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
      
      <div 
        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
        onClick={triggerFileInput}
      >
        <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
        <p className="text-sm text-center text-muted-foreground mb-2">
          {isMobile ? "Toque para selecionar um arquivo" : "Clique para selecionar ou arraste um arquivo"}
        </p>
        <Input
          id="file-upload"
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button 
          variant="outline" 
          className="cursor-pointer w-full sm:w-auto"
          onClick={(e) => {
            e.stopPropagation();
            triggerFileInput();
          }}
        >
          Selecionar arquivo
        </Button>
      </div>
      
      {selectedFile && (
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Arquivo selecionado:</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={removeFile}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground truncate">{selectedFile.name}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file-name">Nome do arquivo</Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Nome do arquivo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
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
        </div>
      )}
      
      {selectedFile && (
        <Button 
          onClick={handleUpload} 
          disabled={isUploading} 
          className="w-full"
        >
          <UploadCloud className="h-4 w-4 mr-2" />
          {isUploading ? "Enviando..." : "Fazer Upload"}
        </Button>
      )}
    </div>
  );
}
