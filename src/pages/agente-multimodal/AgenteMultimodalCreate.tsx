import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface AgentConfigForm {
  name: string;
  bias: string;
  objective: string;
}

interface AgenteMultimodalCreateProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

function buildSystemPrompt(bias: string, objective: string): string {
  return `Você é um assistente de IA multimodal especializado em ${objective}.

${bias ? `Seu viés de comunicação: ${bias}` : ""}

Suas capacidades:
1. Responder perguntas em texto de forma clara e útil
2. Analisar imagens enviadas pelo usuário com detalhes
3. Gerar vídeos quando solicitado (até 8 segundos em formato 16:9)

Quando o usuário pedir para gerar um vídeo, crie um prompt detalhado para o Veo 3.1 Fast
que capture a essência do pedido em linguagem visual, descrevendo movimentos, cenários e ações.

Sempre seja útil, claro e objetivo em suas respostas.`;
}

export default function AgenteMultimodalCreate({ onBack, onSuccess }: AgenteMultimodalCreateProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<AgentConfigForm>({
    name: "",
    bias: "",
    objective: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.objective.trim()) {
      toast({
        title: "Erro",
        description: "Nome e objetivo são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(form.bias, form.objective);

      const { error } = await supabase.from("agente_multimodal_config").insert({
        user_id: user?.id,
        name: form.name.trim(),
        bias: form.bias.trim() || null,
        objective: form.objective.trim(),
        system_prompt: systemPrompt,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agente multimodal criado com sucesso!",
        className: "bg-green-500/10 border-green-500/20 text-green-500",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/agente-multimodal");
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const systemPromptPreview = buildSystemPrompt(form.bias, form.objective);
  const handleGoBack = onBack || (() => navigate("/agente-multimodal"));

  return (
    <div className="container max-w-2xl mx-auto p-4 md:p-6 min-h-[calc(100vh-100px)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Criar Agente Multimodal</h1>
            <p className="text-muted-foreground text-sm">
              Configure um novo assistente com Gemini + Veo 3.1 Fast
            </p>
          </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Configuração do Agente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agente *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Assistente de Marketing, Criador de Conteúdo..."
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Nome identificador para o seu agente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bias">Viés do Agente (opcional)</Label>
              <Textarea
                id="bias"
                value={form.bias}
                onChange={(e) => setForm({ ...form, bias: e.target.value })}
                placeholder="Ex: Seja criativo, use emojis, seja informal e amigável, seja técnico e preciso..."
                disabled={loading}
                rows={3}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Define o tom, estilo e personalidade da comunicação
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo do Agente *</Label>
              <Textarea
                id="objective"
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
                placeholder="Ex: Criar roteiros para vídeos promocionais de produtos, auxiliar no design gráfico, analisar imagens de obras..."
                disabled={loading}
                rows={4}
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Descreva claramente o propósito e responsabilidades do agente
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 border border-purple-500/10">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                Preview do System Prompt
              </h4>
              <pre className="text-xs bg-background p-3 rounded border overflow-x-auto whitespace-pre-wrap font-mono">
                {systemPromptPreview}
              </pre>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleGoBack}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !form.name.trim() || !form.objective.trim()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Criar Agente
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/20">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-2">Capabilities deste Agente:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Gemini 3 Flash para processamento de texto e imagens
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Veo 3.1 Fast para geração de vídeos (8 segundos)
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Detecção automática de intent para geração de vídeos
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Vídeos baixáveis e persistidos no armazenamento
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
