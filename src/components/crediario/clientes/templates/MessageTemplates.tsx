
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Copy, 
  Edit, 
  Plus,
  Send,
  Phone
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MessageTemplate {
  id: string;
  name: string;
  type: "whatsapp" | "sms" | "email";
  category: "first_contact" | "reminder" | "final_notice" | "promise_follow";
  content: string;
  variables: string[];
}

interface MessageTemplatesProps {
  clienteName?: string;
  clientePhone?: string;
  valorDevido?: number;
  diasAtraso?: number;
}

export function MessageTemplates({ 
  clienteName = "Cliente", 
  clientePhone,
  valorDevido = 0,
  diasAtraso = 0 
}: MessageTemplatesProps) {
  const { toast } = useToast();
  
  const [templates] = useState<MessageTemplate[]>([
    {
      id: "1",
      name: "Primeiro Contato - WhatsApp",
      type: "whatsapp",
      category: "first_contact",
      content: "Olá {nome}, tudo bem? Estou entrando em contato para conversar sobre sua conta em atraso de R$ {valor}. Podemos resolver isso hoje mesmo! 😊",
      variables: ["nome", "valor"]
    },
    {
      id: "2",
      name: "Lembrete Amigável",
      type: "whatsapp", 
      category: "reminder",
      content: "Oi {nome}! Só passando para lembrar do pagamento de R$ {valor} que está {dias} dias em atraso. Que tal quitarmos hoje? Posso te ajudar com as opções de pagamento! 💳",
      variables: ["nome", "valor", "dias"]
    },
    {
      id: "3",
      name: "Aviso Final",
      type: "whatsapp",
      category: "final_notice",
      content: "⚠️ {nome}, sua conta de R$ {valor} está com {dias} dias de atraso. Para evitar maiores transtornos, precisamos regularizar hoje. Entre em contato comigo!",
      variables: ["nome", "valor", "dias"]
    },
    {
      id: "4",
      name: "Follow-up de Promessa",
      type: "whatsapp",
      category: "promise_follow",
      content: "Oi {nome}! Como combinamos, hoje é o dia do pagamento de R$ {valor}. Já conseguiu efetuar? Se precisar de ajuda, estou aqui! 😊",
      variables: ["nome", "valor"]
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const categoryLabels = {
    first_contact: "Primeiro Contato",
    reminder: "Lembrete",
    final_notice: "Aviso Final", 
    promise_follow: "Follow-up"
  };

  const categoryColors = {
    first_contact: "bg-blue-100 text-blue-800",
    reminder: "bg-yellow-100 text-yellow-800",
    final_notice: "bg-red-100 text-red-800",
    promise_follow: "bg-green-100 text-green-800"
  };

  const replaceVariables = (content: string) => {
    return content
      .replace(/{nome}/g, clienteName)
      .replace(/{valor}/g, `${valorDevido.toFixed(2)}`)
      .replace(/{dias}/g, diasAtraso.toString());
  };

  const handleCopyMessage = (template: MessageTemplate) => {
    const message = replaceVariables(template.content);
    navigator.clipboard.writeText(message);
    toast({
      title: "Mensagem copiada!",
      description: "A mensagem foi copiada para a área de transferência.",
    });
  };

  const handleSendWhatsApp = (template: MessageTemplate) => {
    if (!clientePhone) {
      toast({
        title: "Telefone não disponível",
        description: "Número de telefone do cliente não cadastrado.",
        variant: "destructive",
      });
      return;
    }

    const message = replaceVariables(template.content);
    const whatsappUrl = `https://wa.me/55${clientePhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(t => t.category === category);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Templates de Mensagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Templates por Categoria */}
        {Object.entries(categoryLabels).map(([category, label]) => {
          const categoryTemplates = getTemplatesByCategory(category);
          if (categoryTemplates.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                  {label}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {categoryTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyMessage(template)}
                          className="gap-1"
                        >
                          <Copy className="h-3 w-3" />
                          Copiar
                        </Button>
                        {template.type === "whatsapp" && clientePhone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendWhatsApp(template)}
                            className="gap-1 text-green-600"
                          >
                            <Send className="h-3 w-3" />
                            Enviar
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded border">
                      {replaceVariables(template.content)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Mensagem Personalizada */}
        <div className="space-y-3 border-t pt-6">
          <h4 className="font-medium">Mensagem Personalizada</h4>
          <Textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Digite sua mensagem personalizada aqui..."
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigator.clipboard.writeText(customMessage)}
              disabled={!customMessage}
              className="gap-1"
            >
              <Copy className="h-3 w-3" />
              Copiar
            </Button>
            {clientePhone && (
              <Button
                variant="outline"
                onClick={() => {
                  const whatsappUrl = `https://wa.me/55${clientePhone.replace(/\D/g, '')}?text=${encodeURIComponent(customMessage)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                disabled={!customMessage}
                className="gap-1 text-green-600"
              >
                <Send className="h-3 w-3" />
                WhatsApp
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
