
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"gerente" | "vendedor" | "crediarista">("vendedor");
  const [resetRequested, setResetRequested] = useState(false);

  // Função para login
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

  // Função para registro
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

  // Função para recuperação de senha
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao solicitar redefinição de senha",
          description: error.message,
        });
        return;
      }

      setResetRequested(true);
      toast({
        title: "Solicitação enviada",
        description: "Verifique seu e-mail para redefinir sua senha.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao solicitar redefinição de senha",
        description: "Ocorreu um erro inesperado ao solicitar redefinição de senha.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <ShoppingBag className="h-10 w-10 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-primary">Filial 96</h1>
          </div>
          <ThemeToggle />
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Criar conta</TabsTrigger>
            <TabsTrigger value="reset" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Recuperar senha</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="border-border shadow-lg">
              <CardHeader className="bg-card rounded-t-md">
                <CardTitle className="text-card-foreground">Login</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Acesse sua conta para gerenciar suas atividades na loja.
                </CardDescription>
              </CardHeader>
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
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="border-border shadow-lg">
              <CardHeader className="bg-card rounded-t-md">
                <CardTitle className="text-card-foreground">Criar conta</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Crie uma nova conta para acessar o sistema.
                </CardDescription>
              </CardHeader>
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
            </Card>
          </TabsContent>
          <TabsContent value="reset">
            <Card className="border-border shadow-lg">
              <CardHeader className="bg-card rounded-t-md">
                <CardTitle className="text-card-foreground">Recuperar senha</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Digite seu e-mail para receber instruções de recuperação de senha.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordReset}>
                <CardContent className="space-y-4 pt-6">
                  {resetRequested ? (
                    <div className="rounded-md bg-accent p-4 border border-border">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-foreground">
                            Enviamos um e-mail com instruções para redefinir sua senha. Verifique sua caixa de entrada.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="email-reset" className="text-foreground">E-mail</Label>
                      <Input
                        id="email-reset"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-input focus-visible:ring-ring"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!resetRequested && (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90" 
                      type="submit" 
                      disabled={isLoading}>
                      {isLoading ? "Enviando..." : "Enviar link de recuperação"}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
