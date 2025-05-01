
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CardContent, CardFooter } from "@/components/ui/card";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"gerente" | "vendedor" | "crediarista">("vendedor");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar conta",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Conta criada com sucesso",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: "Ocorreu um erro inesperado ao criar sua conta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Nome completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-input focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-signup" className="text-foreground">E-mail</Label>
          <Input
            id="email-signup"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-input focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password-signup" className="text-foreground">Senha</Label>
          <Input
            id="password-signup"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-input focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role" className="text-foreground">Função</Label>
          <select
            id="role"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={role}
            onChange={(e) => setRole(e.target.value as "gerente" | "vendedor" | "crediarista")}
            required
          >
            <option value="vendedor">Vendedor</option>
            <option value="gerente">Gerente</option>
            <option value="crediarista">Crediarista</option>
          </select>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          type="submit" 
          disabled={isLoading}>
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>
      </CardFooter>
    </form>
  );
}
