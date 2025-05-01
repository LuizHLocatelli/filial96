
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CardContent, CardFooter } from "@/components/ui/card";

export function LoginForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado ao fazer login.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-input focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-input focus-visible:ring-ring"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          type="submit" 
          disabled={isLoading}>
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </CardFooter>
    </form>
  );
}
