
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/crediario/useFileUpload";
import { useAuth } from "@/contexts/auth";
import { 
  orientacaoFormSchema, 
  OrientacaoFormValues 
} from "../schemas/orientacaoSchema";

interface UseOrientacaoUploadProps {
  onSuccess?: () => void;
}

export function useOrientacaoUpload({ onSuccess }: UseOrientacaoUploadProps = {}) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      form.setValue("arquivo", file, { shouldValidate: true });
    }
  };

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

  return {
    form,
    arquivo,
    isUploading,
    progress,
    handleFileChange,
    onSubmit
  };
}
