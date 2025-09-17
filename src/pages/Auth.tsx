import { useState } from "react";
import { useAurora } from "@/hooks/useAurora";
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
import { EnhancedAuthHeader } from "@/components/auth/EnhancedAuthHeader";
import { EnhancedLoginForm } from "@/components/auth/EnhancedLoginForm";
import { EnhancedSignupForm } from "@/components/auth/EnhancedSignupForm";
import { AuthBackgroundElements } from "@/components/auth/AuthBackgroundElements";
import { TrustIndicators } from "@/components/auth/TrustIndicators";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const formRef = useAurora<HTMLDivElement>();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AuthBackgroundElements />
      
      <div className="w-full max-w-md relative z-10">
        <EnhancedAuthHeader />

        <div
          ref={formRef}
          className="glass-card aurora-effect border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-gradient-to-r from-muted/50 to-muted/30 p-1 m-4 rounded-xl">
              <TabsList className="grid w-full grid-cols-2 bg-transparent gap-1">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:btn-primary-standard rounded-lg font-medium transition-all duration-200 data-[state=active]:shadow-lg"
                >
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:btn-primary-standard rounded-lg font-medium transition-all duration-200 data-[state=active]:shadow-lg"
                >
                  Criar conta
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="login" className="mt-0">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="pb-4 px-6">
                  <CardTitle className="text-xl font-semibold text-center">
                    Faça login em sua conta
                  </CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    Acesse o sistema de gestão da Filial 96
                  </CardDescription>
                </CardHeader>
                <EnhancedLoginForm />
              </Card>
            </TabsContent>
            
            <TabsContent value="signup" className="mt-0">
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="pb-4 px-6">
                  <CardTitle className="text-xl font-semibold text-center">
                    Crie sua conta
                  </CardTitle>
                  <CardDescription className="text-center text-muted-foreground">
                    Junte-se à equipe da Filial 96
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-4">
                  <Alert variant="glass" className="border-primary/30 bg-primary/10">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm text-foreground/90">
                      <strong>Atenção:</strong> Para criar uma nova conta no sistema, entre em contato com o Gerente da Filial 96. 
                      O processo de criação de contas requer autorização prévia.
                    </AlertDescription>
                  </Alert>
                </div>
                <EnhancedSignupForm />
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="px-6 pb-6">
            <TrustIndicators />
          </div>
        </div>
      </div>
    </div>
  );
}
