
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

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfoForm } from "@/components/profile/PersonalInfoForm";
import { EmailForm } from "@/components/profile/EmailForm";
import { PasswordForm } from "@/components/profile/PasswordForm";
import { DeleteAccountForm } from "@/components/profile/DeleteAccountForm";

export default function Profile() {
  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <ProfileHeader />

      <Tabs defaultValue="info">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="security" className="flex-1">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 pt-4">
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
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
