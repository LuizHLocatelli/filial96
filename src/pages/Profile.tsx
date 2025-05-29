import {
  Card,
  CardContent,
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
import { User, Shield } from "lucide-react";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { EmailForm } from "@/components/profile/EmailForm";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { DeleteAccountForm } from "@/components/profile/DeleteAccountForm";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Profile() {
  const navigationTabs = [
    {
      value: "info",
      label: "Informações Pessoais",
      icon: User,
      component: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais e como deseja ser chamado no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alterar Email</CardTitle>
              <CardDescription>
                Atualize seu endereço de email. Você precisará confirmar o novo email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailForm />
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      value: "security",
      label: "Segurança",
      icon: Shield,
      component: (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Defina uma nova senha para sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Excluir Conta</CardTitle>
              <CardDescription>
                Esta ação é permanente e não pode ser desfeita.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountForm />
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="md">
      <PageHeader
        title="Perfil"
        description="Gerencie suas informações pessoais e configurações de segurança"
        icon={User}
        iconColor="text-primary"
        variant="minimal"
      />

      <ProfileHeader />

      <PageNavigation
        tabs={navigationTabs}
        activeTab="info"
        onTabChange={() => {}}
        variant="tabs"
      />
    </PageLayout>
  );
}
