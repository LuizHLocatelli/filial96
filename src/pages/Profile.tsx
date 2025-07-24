import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Shield, Settings, Bug, Bell } from "lucide-react";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { EmailForm } from "@/components/profile/EmailForm";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { SecuritySettingsForm } from "@/components/profile/SecuritySettingsForm";
import { DeleteAccountForm } from "@/components/profile/DeleteAccountForm";
import { NotificationsDebug } from "@/components/notifications/NotificationsDebug";

import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "info";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const navigationTabs = [
    {
      value: "info",
      label: "Informações Pessoais",
      icon: User,
      description: "Dados pessoais e configurações de conta",
      component: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais, telefone e como deseja ser chamado no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalInfoForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email da Conta</CardTitle>
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
      description: "Senha e configurações de segurança",
      component: (
        <div className="space-y-6">
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

          <SecuritySettingsForm />

          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>
                Ações irreversíveis da conta. Proceda com cautela.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountForm />
            </CardContent>
          </Card>
        </div>
      )
    },

    {
      value: "debug",
      label: "Debug Notificações",
      icon: Bug,
      description: "Diagnóstico do sistema de notificações",
      component: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico de Notificações</CardTitle>
              <CardDescription>
                Esta ferramenta ajuda a identificar e resolver problemas com as notificações em tempo real.
                Use este diagnóstico para verificar se o sistema está funcionando corretamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationsDebug />
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="2xl">
      <PageHeader
        title="Configurações do Perfil"
        description="Gerencie suas informações pessoais e configurações de segurança"
        icon={User}
        iconColor="text-primary"
        variant="minimal"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Perfil" }
        ]}
      />

      <ProfileHeader />

      <PageNavigation
        tabs={navigationTabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="tabs"
      />
    </PageLayout>
  );
}
