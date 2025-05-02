
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  
  // Verificar se há um token de acesso na URL (link de recuperação de senha)
  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const type = searchParams.get("type");
    
    // Se temos um token de acesso e é do tipo "recovery", vamos para a aba de atualização de senha
    if ((accessToken || refreshToken) && type === "recovery") {
      // Importar o token para a sessão atual sem fazer login automático
      const setAuthFromUrl = async () => {
        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          
          // Habilitar a exibição da aba de atualização de senha
          setShowUpdatePassword(true);
          // Troca para a aba de atualização de senha
          setActiveTab("update-password");
        }
      };
      
      setAuthFromUrl();
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <LoginForm />
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
              <SignupForm />
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
              <PasswordResetForm />
            </Card>
          </TabsContent>
          {showUpdatePassword && (
            <TabsContent value="update-password">
              <Card className="border-border shadow-lg">
                <CardHeader className="bg-card rounded-t-md">
                  <CardTitle className="text-card-foreground">Redefinir senha</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Digite e confirme sua nova senha abaixo.
                  </CardDescription>
                </CardHeader>
                <UpdatePasswordForm />
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
