import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, FileArchive, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DirectoryCategory } from '../types';

export interface FileUploaderProps {
  isUploading: boolean;
  onUpload: (file: File, categoryId: string | null, isFeatured: boolean) => Promise<boolean>;
  categories: DirectoryCategory[];
}

export function FileUploader({ 
  isUploading, 
  onUpload, 
  categories 
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>('none');
  const [isFeatured, setIsFeatured] = useState(false);
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: 'Arquivo necessário',
        description: 'Por favor, selecione um arquivo para upload.',
        variant: 'destructive',
      });
      return;
    }
    
    const success = await onUpload(
      file, 
      categoryId === 'none' ? null : categoryId,
      isFeatured
    );
    
    if (success) {
      // Reset form
      setFile(null);
      setCategoryId('none');
      setIsFeatured(false);
      setDescription('');
      
      // Clear file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const clearFile = () => {
    setFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <Card className="border-2 border-solid shadow-soft transition-all duration-200 hover:shadow-medium">
      <CardHeader>
        <CardTitle className="text-lg">Enviar Arquivo</CardTitle>
        <CardDescription>
          Adicione um novo arquivo ao diretório
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="text-sm font-medium">Arquivo</Label>
            
            {file ? (
              <div className="flex items-center border-2 border-solid rounded-md p-3 mt-2 bg-muted/50">
                <FileArchive className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-sm flex-1 truncate" title={file.name}>
                  {file.name}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFile}
                  className="h-7 w-7 p-0 hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="cursor-pointer bg-muted/40 border-2 border-solid transition-colors"
                />
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="category" className="text-sm font-medium">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-muted/40 border-2 border-solid transition-colors mt-2">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-sm font-medium">Descrição do arquivo (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione uma descrição para este arquivo"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-muted/40 border-2 border-solid transition-colors mt-2"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
            <Label htmlFor="featured" className="text-sm font-medium">Destacar este arquivo</Label>
          </div>
          
          <Button 
            type="submit" 
            variant="success"
            className="w-full transition-all duration-200" 
            disabled={isUploading || !file}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Enviando...' : 'Enviar arquivo'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
