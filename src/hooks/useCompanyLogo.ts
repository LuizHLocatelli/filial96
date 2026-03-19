import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export interface CompanySettings {
  id: string;
  logo_url: string | null;
  logo_path: string | null;
  updated_at: string | null;
}

export function useCompanyLogo() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching company settings:", error);
        setSettings(null);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching company settings:", error);
      setSettings(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const uploadLogo = useCallback(async (file: File): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Validate file
      if (!file.type.startsWith("image/")) {
        toast.error("Erro", {
          description: "Selecione um arquivo de imagem válido",
        });
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Erro", {
          description: "Imagem muito grande (máx. 5MB)",
        });
        return false;
      }

      // Upload to storage
      const fileName = `company-logo-${uuidv4()}.${file.name.split(".").pop()}`;
      const filePath = `company/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("company-assets")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("company-assets")
        .getPublicUrl(filePath);

      // Update database
      const { error: updateError } = await supabase
        .from("company_settings")
        .upsert({
          id: settings?.id,
          logo_url: publicUrlData.publicUrl,
          logo_path: filePath,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Refresh settings
      await fetchSettings();

      toast.success("Sucesso", {
        description: "Logo da empresa atualizado com sucesso!",
      });

      return true;
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Erro", {
        description: "Não foi possível atualizar o logo. Tente novamente.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings?.id, fetchSettings]);

  const removeLogo = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      if (settings?.logo_path) {
        // Remove from storage
        await supabase.storage
          .from("company-assets")
          .remove([settings.logo_path]);
      }

      // Update database to null
      const { error: updateError } = await supabase
        .from("company_settings")
        .upsert({
          id: settings?.id,
          logo_url: null,
          logo_path: null,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Refresh settings
      await fetchSettings();

      toast.success("Sucesso", {
        description: "Logo da empresa removido.",
      });

      return true;
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("Erro", {
        description: "Não foi possível remover o logo. Tente novamente.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings?.id, settings?.logo_path, fetchSettings]);

  const getLogoAsBase64 = useCallback(async (): Promise<string | null> => {
    if (!settings?.logo_url) return null;

    try {
      const response = await fetch(settings.logo_url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting logo to base64:", error);
      return null;
    }
  }, [settings?.logo_url]);

  return {
    settings,
    logoUrl: settings?.logo_url || null,
    isLoading,
    isSaving,
    uploadLogo,
    removeLogo,
    getLogoAsBase64,
    refresh: fetchSettings,
  };
}
