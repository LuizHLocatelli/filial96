
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileArchive, Upload, CheckCircle } from 'lucide-react';
import { DirectoryCategory } from '../hooks/useDirectoryCategories';

const fileFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  description: z.string().optional(),
  category_id: z.string().optional(),
  is_featured: z.boolean().default(false),
  file: z
    .instanceof(File, { message: 'Arquivo é obrigatório' })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'O arquivo deve ter no máximo 10MB',
    }),
});

type FileFormValues = z.infer<typeof fileFormSchema>;

export interface FileUploaderProps {
  isUploading: boolean;
  onUpload: (
    file: File, 
    categoryId: string | null, 
    isFeatured: boolean
  ) => Promise<boolean>;
  categories: DirectoryCategory[];
  tableName?: string;
}

export function FileUploader({ isUploading, onUpload, categories, tableName = 'crediario_directory_files' }: FileUploaderProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const form = useForm<FileFormValues>({
    resolver: zodResolver(fileFormSchema),
    defaultValues: {
      name: '',
      description: '',
      is_featured: false,
    },
  });

  const onSubmit = async (data: FileFormValues) => {
    if (!user) {
      return;
    }

    setProgress(0);
    setUploadSuccess(false);

    const simulateProgress = () => {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = Math.min(oldProgress + Math.random() * 10, 90);
          return newProgress;
        });
      }, 200);

      return interval;
    };

    const interval = simulateProgress();

    const success = await onUpload(
      data.file,
      data.category_id || null,
      data.is_featured || false
    );

    clearInterval(interval);

    if (success) {
      setProgress(100);
      setUploadSuccess(true);
      form.reset();

      // Reset success state after 3 seconds
      setTimeout(() => {
        setUploadSuccess(false);
        setProgress(0);
      }, 3000);
    } else {
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Use o nome do arquivo como nome padrão se o campo estiver vazio
      if (!form.getValues('name')) {
        form.setValue('name', file.name.split('.')[0], { shouldValidate: true });
      }
      form.setValue('file', file, { shouldValidate: true });
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="arquivo">Arquivo</Label>
              <Input
                id="arquivo"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('arquivo')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Escolher Arquivo
                </Button>
                {form.watch('file') && (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {form.watch('file').name}
                  </span>
                )}
              </div>
              {form.formState.errors.file && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.file.message}
                </p>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nenhuma</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Destacar arquivo</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {(isUploading || uploadSuccess) && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              {uploadSuccess ? (
                <p className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Arquivo enviado com sucesso!
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enviando... {Math.round(progress)}%
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isUploading || uploadSuccess}
          >
            <FileArchive className="mr-2 h-4 w-4" />
            {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
