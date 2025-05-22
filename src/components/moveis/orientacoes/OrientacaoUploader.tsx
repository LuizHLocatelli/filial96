
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/crediario/useFileUpload";
import { useAuth } from "@/contexts/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Upload } from "lucide-react";

interface OrientacaoUploaderProps {
  onSuccess?: () => void;
}

const orientacaoFormSchema = z.object({
  titulo: z.string().min(3, { message: "Título deve ter pelo menos 3 caracteres" }),
  tipo: z.enum(["vm", "informativo", "outro"], {
    required_error: "Selecione um tipo",
  }),
  descricao: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  arquivo: z
    .instanceof(File, { message: "Selecione um arquivo" })
    .refine((file) => file.size > 0, { message: "Arquivo obrigatório" })
    .refine((file) => file.size <= 10 * 1024 * 1024, { message: "O arquivo deve ter no máximo 10MB" }),
});

type OrientacaoFormValues = z.infer<typeof orientacaoFormSchema>;

export function OrientacaoUploader({ onSuccess }: OrientacaoUploaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, isUploading, progress } = useFileUpload();
  const [arquivo, setArquivo] = useState<File | null>(null);

  const form = useForm<OrientacaoFormValues>({
    resolver: zodResolver(orientacaoFormSchema),
    defaultValues: {
      titulo: "",
      tipo: "vm",
      descricao: "",
    },
  });

  const onSubmit = async (data: OrientacaoFormValues) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar arquivos.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Upload do arquivo para o Storage
      const arquivo = data.arquivo;
      const uploadResult = await uploadFile(arquivo, {
        bucketName: "moveis_arquivos",
        folder: "orientacoes",
        generateUniqueName: true,
      });

      if (!uploadResult) {
        throw new Error("Erro ao enviar o arquivo.");
      }

      // 2. Salvar registro no banco de dados
      const { error } = await supabase.from("moveis_orientacoes").insert({
        titulo: data.titulo,
        tipo: data.tipo,
        descricao: data.descricao,
        arquivo_url: uploadResult.file_url,
        arquivo_nome: arquivo.name,
        arquivo_tipo: arquivo.type,
        criado_por: user.id,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Orientação enviada com sucesso.",
      });

      // Limpar formulário
      form.reset();
      setArquivo(null);

      // Callback de sucesso
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Erro ao enviar orientação:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao enviar a orientação.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      form.setValue("arquivo", file, { shouldValidate: true });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-1">Nova Orientação</h3>
        <p className="text-muted-foreground text-sm">
          Envie uma nova orientação ou informativo para o setor de móveis
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título da orientação" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vm">Visual Merchandising</SelectItem>
                    <SelectItem value="informativo">Informativo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva esta orientação"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arquivo"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Arquivo</FormLabel>
                <FormControl>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Input
                      id="arquivo"
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                      {...field}
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("arquivo")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Escolher Arquivo
                      </Button>
                      {arquivo && (
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {arquivo.name}
                        </span>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {isUploading && progress !== undefined && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Enviando... {progress}%
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? (
                <>
                  <FileText className="mr-2 h-4 w-4 animate-pulse" />
                  Enviando...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Enviar Orientação
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
