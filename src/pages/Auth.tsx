
import { useState } from "react";
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

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted px-4">
      <div className="w-full max-w-md">
        <AuthHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Criar conta</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
