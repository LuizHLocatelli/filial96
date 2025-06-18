import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  Plus, 
  Calendar,
  User,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Contact {
  id: string;
  type: "phone" | "whatsapp" | "email" | "visit";
  date: Date;
  description: string;
  result: "success" | "no_answer" | "promise" | "refused";
  nextContact?: Date;
  amount?: number;
}

interface ContactHistoryProps {
  clienteId: string;
  clienteName: string;
}

interface NewContactForm {
  type: "phone" | "whatsapp" | "email" | "visit";
  description: string;
  result: "success" | "no_answer" | "promise" | "refused";
  nextContact: string;
  amount: string;
}

export function ContactHistory({ clienteId, clienteName }: ContactHistoryProps) {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      type: "phone",
      date: new Date(2024, 5, 1),
      description: "Cliente prometeu pagamento até sexta-feira",
      result: "promise",
      nextContact: new Date(2024, 5, 5),
      amount: 150
    },
    {
      id: "2",
      type: "whatsapp",
      date: new Date(2024, 5, 3),
      description: "Mensagem enviada sobre vencimento próximo",
      result: "no_answer"
    }
  ]);

  const [newContact, setNewContact] = useState<NewContactForm>({
    type: "phone",
    description: "",
    result: "success",
    nextContact: "",
    amount: ""
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const contactTypeIcons = {
    phone: Phone,
    whatsapp: MessageSquare,
    email: Mail,
    visit: User
  };

  const contactTypeLabels = {
    phone: "Telefone",
    whatsapp: "WhatsApp",
    email: "E-mail",
    visit: "Visita"
  };

  const resultLabels = {
    success: "Sucesso",
    no_answer: "Não atendeu",
    promise: "Promessa",
    refused: "Recusou"
  };

  const resultColors = {
    success: "bg-green-100 text-green-800",
    no_answer: "bg-gray-100 text-gray-800",
    promise: "bg-yellow-100 text-yellow-800",
    refused: "bg-red-100 text-red-800"
  };

  const handleAddContact = () => {
    const contact: Contact = {
      id: Date.now().toString(),
      type: newContact.type,
      date: new Date(),
      description: newContact.description,
      result: newContact.result,
      nextContact: newContact.nextContact ? new Date(newContact.nextContact) : undefined,
      amount: newContact.amount ? parseFloat(newContact.amount) : undefined
    };

    setContacts(prev => [contact, ...prev]);
    setNewContact({
      type: "phone",
      description: "",
      result: "success",
      nextContact: "",
      amount: ""
    });
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Contatos - {clienteName}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Contato
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Novo Contato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Contato</label>
                  <Select value={newContact.type} onValueChange={(value: "phone" | "whatsapp" | "email" | "visit") => setNewContact(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="visit">Visita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={newContact.description}
                    onChange={(e) => setNewContact(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que aconteceu no contato..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Resultado</label>
                  <Select value={newContact.result} onValueChange={(value: "success" | "no_answer" | "promise" | "refused") => setNewContact(prev => ({ ...prev, result: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="no_answer">Não atendeu</SelectItem>
                      <SelectItem value="promise">Promessa</SelectItem>
                      <SelectItem value="refused">Recusou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newContact.result === "promise" && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Valor Prometido (R$)</label>
                      <Input
                        type="number"
                        value={newContact.amount}
                        onChange={(e) => setNewContact(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Próximo Contato</label>
                      <Input
                        type="date"
                        value={newContact.nextContact}
                        onChange={(e) => setNewContact(prev => ({ ...prev, nextContact: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <Button onClick={handleAddContact} className="w-full">
                  Registrar Contato
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>Nenhum contato registrado ainda</p>
            </div>
          ) : (
            contacts.map((contact) => {
              const Icon = contactTypeIcons[contact.type];
              return (
                <div key={contact.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {contactTypeLabels[contact.type]}
                      </span>
                      <Badge className={resultColors[contact.result]}>
                        {resultLabels[contact.result]}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(contact.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {contact.description}
                  </p>
                  
                  {contact.amount && (
                    <div className="text-sm text-green-600 font-medium mb-1">
                      Valor prometido: R$ {contact.amount.toFixed(2)}
                    </div>
                  )}
                  
                  {contact.nextContact && (
                    <div className="text-sm text-primary flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Próximo contato: {format(contact.nextContact, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
