
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Copy, 
  Send,
  Clock,
  AlertTriangle,
  Phone
} from "lucide-react";

interface MessageTemplatesProps {
  clienteName: string;
  valorDevido: number;
  diasAtraso: number;
}

export function MessageTemplates({ clienteName, valorDevido, diasAtraso }: MessageTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");

  const templates = [
    {
      id: "lembrete_amigavel",
      title: "Lembrete Amigável",
      description: "Para clientes com poucos dias de atraso",
      priority: "low",
      message: `Olá ${clienteName}! 😊

Esperamos que esteja tudo bem com você. Este é apenas um lembrete amigável sobre seu pagamento que venceu há ${diasAtraso} dias.

💰 Valor: R$ ${valorDevido.toFixed(2)}

Sabemos que às vezes pode acontecer um esquecimento. Se precisar de ajuda ou tiver alguma dificuldade, estamos aqui para encontrar a melhor solução juntos.

Você pode fazer o pagamento através de PIX ou entrar em contato conosco para outras opções.

Muito obrigado! 🙏`
    },
    {
      id: "cobranca_formal",
      title: "Cobrança Formal",
      description: "Para clientes com mais de 15 dias de atraso",
      priority: "medium",
      message: `${clienteName}, boa tarde.

Identificamos que seu pagamento encontra-se em atraso há ${diasAtraso} dias.

📋 Detalhes da pendência:
• Valor: R$ ${valorDevido.toFixed(2)}
• Dias em atraso: ${diasAtraso}

É importante regularizar esta situação o quanto antes para evitar maiores complicações. 

Estamos disponíveis para negociar condições especiais de pagamento que se adequem à sua realidade.

Entre em contato conosco hoje mesmo.

Atenciosamente,
Equipe de Cobrança`
    },
    {
      id: "ultima_oportunidade",
      title: "Última Oportunidade",
      description: "Para clientes com mais de 30 dias de atraso",
      priority: "high",
      message: `⚠️ IMPORTANTE - ${clienteName}

Seu pagamento está em atraso há ${diasAtraso} dias.

🚨 Esta é sua ÚLTIMA OPORTUNIDADE de regularizar a situação antes que medidas legais sejam tomadas.

💰 Valor total: R$ ${valorDevido.toFixed(2)}

Oferecemos as seguintes opções:
✅ Pagamento à vista com desconto
✅ Parcelamento especial
✅ Renegociação de condições

⏰ PRAZO LIMITE: 48 horas

Não perca esta chance! Entre em contato IMEDIATAMENTE.

📞 Ligue agora ou responda esta mensagem.`
    },
    {
      id: "proposta_acordo",
      title: "Proposta de Acordo",
      description: "Para negociação e reparcelamento",
      priority: "medium",
      message: `${clienteName}, temos uma proposta especial para você! 🤝

Entendemos que às vezes surgem dificuldades financeiras. Por isso, preparamos condições especiais para regularizar sua situação:

💳 Valor original: R$ ${valorDevido.toFixed(2)}
🎯 Condições especiais disponíveis:
• Desconto para pagamento à vista
• Parcelamento em até 6x
• Entrada facilitada

Esta proposta é válida por tempo limitado!

Vamos conversar e encontrar a melhor solução? 
Responda esta mensagem ou ligue para nós.

Estamos aqui para ajudar! 💪`
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return AlertTriangle;
      case "medium": return Clock;
      case "low": return MessageSquare;
      default: return MessageSquare;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Toast notification would be nice here
  };

  const sendWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Templates de Mensagem - {clienteName}
          </CardTitle>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>Valor devido: R$ {valorDevido.toFixed(2)}</span>
            <span>•</span>
            <span>{diasAtraso} dias em atraso</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {templates.map((template) => {
              const Icon = getPriorityIcon(template.priority);
              return (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    setCustomMessage(template.message);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <h4 className="font-medium">{template.title}</h4>
                      </div>
                      <Badge className={getPriorityColor(template.priority)}>
                        {template.priority === "high" ? "Urgente" : 
                         template.priority === "medium" ? "Moderado" : "Baixo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <div className="bg-muted/50 p-3 rounded text-sm max-h-24 overflow-y-auto">
                      {template.message.substring(0, 150)}...
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Prévia da Mensagem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={10}
              className="resize-none"
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(customMessage)}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              
              <Button
                onClick={() => sendWhatsApp(customMessage)}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <MessageSquare className="h-4 w-4" />
                Enviar WhatsApp
              </Button>
              
              <Button
                variant="outline"
                className="gap-2"
              >
                <Phone className="h-4 w-4" />
                Ligar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
