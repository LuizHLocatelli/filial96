import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth";

interface CardUploadState {
  title: string;
  code: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  selectedFile: File | null;
  previewUrl: string | null;
  isSubmitting: boolean;
  folderId: string | null;
}

interface UseCardUploadProps {
  sector: "furniture" | "fashion" | "loan" | "service";
  initialFolderId: string | null;
  onSuccess: () => void;
}

export function useCardUpload({ sector, initialFolderId, onSuccess }: UseCardUploadProps) {
  const [state, setState] = useState<CardUploadState>({
    title: "",
    code: "",
    startDate: undefined,
    endDate: undefined,
    selectedFile: null,
    previewUrl: null,
    isSubmitting: false,
    folderId: initialFolderId,
  });
  const { user } = useAuth();

  const resetState = () => {
    setState({
      title: "",
      code: "",
      startDate: undefined,
      endDate: undefined,
      selectedFile: null,
      previewUrl: null,
      isSubmitting: false,
      folderId: initialFolderId,
    });
  };

  const setTitle = (title: string) => {
    setState(prev => ({ ...prev, title }));
  };

  const setCode = (code: string) => {
    setState(prev => ({ ...prev, code }));
  };

  const setStartDate = (date: Date | undefined) => {
    setState(prev => ({ ...prev, startDate: date }));
  };

  const setEndDate = (date: Date | undefined) => {
    setState(prev => ({ ...prev, endDate: date }));
  };

  const setFolderId = (folderId: string | null) => {
    setState(prev => ({ ...prev, folderId }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Erro",
          description: "O arquivo selecionado não é uma imagem",
          variant: "destructive"
        });
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setState(prev => ({
          ...prev,
          selectedFile: file,
          previewUrl: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setState(prev => ({
      ...prev,
      selectedFile: null,
      previewUrl: null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.title.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um título para o card",
        variant: "destructive"
      });
      return;
    }
    
    if (!state.selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem",
        variant: "destructive"
      });
      return;
    }

    if (state.endDate && state.startDate && state.endDate < state.startDate) {
      toast({
        title: "Erro de Validação",
        description: "A data final não pode ser anterior à data de início.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar cards promocionais",
        variant: "destructive"
      });
      return;
    }
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // 1. Upload image to storage
      const fileExt = state.selectedFile.name.split('.').pop();
      const filePath = `${sector}/${uuidv4()}.${fileExt}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('promotional_cards')
        .upload(filePath, state.selectedFile);
      
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: publicUrlData } = await supabase.storage
        .from('promotional_cards')
        .getPublicUrl(filePath);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // 3. Save card data to database
      // Get the highest current position to place the new card at the end
      const { data: positionData } = await supabase
        .from('promotional_cards')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);
      
      const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0;
      
      // Convert Date to ISO string if it exists, otherwise set to null
      const formattedStartDate = state.startDate ? state.startDate.toISOString() : null;
      const formattedEndDate = state.endDate ? state.endDate.toISOString() : null;
      
      const { error: insertError } = await supabase.from('promotional_cards').insert({
        title: state.title.trim(),
        code: state.code.trim(),
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        image_url: imageUrl,
        folder_id: state.folderId,
        sector,
        created_by: user.id,
        position
      });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Sucesso",
        description: "Card promocional criado com sucesso"
      });
      
      resetState();
      onSuccess();
    } catch (error) {
      console.error('Error creating promotional card:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o card promocional",
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    ...state,
    setTitle,
    setCode,
    setStartDate,
    setEndDate,
    setFolderId,
    handleFileChange,
    removeImage,
    handleSubmit,
    resetState
  };
}
