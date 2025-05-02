
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Schema de validação para informações pessoais
const personalInfoSchema = z.object({
  fullName: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
  displayName: z.string().min(2, "Nome de exibição deve ter pelo menos 2 caracteres"),
});

// Schema de validação para alteração de email
const emailSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

// Schema de validação para alteração de senha
const passwordSchema = z.object({
  currentPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  newPassword: z
    .string()
    .min(8, "A nova senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

// Schema de validação para exclusão de conta
const deleteAccountSchema = z.object({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmation: z.literal("excluir minha conta", {
    errorMap: () => ({ message: "Digite 'excluir minha conta' para confirmar" }),
  }),
});

export default function Profile() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Formulário de informações pessoais
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: profile?.name || "",
      displayName: profile?.displayName || "",
    },
  });

  // Formulário de alteração de email
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: user?.email || "",
      password: "",
    },
  });

  // Formulário de alteração de senha
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Formulário de exclusão de conta
  const deleteAccountForm = useForm<z.infer<typeof deleteAccountSchema>>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
      confirmation: "" as any,
    },
  });

  // Atualizar formulário quando o perfil for carregado
  useEffect(() => {
    if (profile) {
      personalInfoForm.reset({
        fullName: profile.name,
        displayName: profile.displayName || profile.name.split(" ")[0],
      });
    }
    if (user) {
      emailForm.reset({
        email: user.email || "",
        password: "",
      });
    }
  }, [profile, user]);

  // Função para atualizar informações pessoais
  const onUpdatePersonalInfo = async (data: z.infer<typeof personalInfoSchema>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.fullName,
          display_name: data.displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações pessoais foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar email
  const onUpdateEmail = async (data: z.infer<typeof emailSchema>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser(
        { 
          email: data.email 
        },
        { 
          emailRedirectTo: window.location.origin 
        }
      );

      if (error) throw error;

      toast({
        title: "Solicitação enviada",
        description: "Verifique seu email para confirmar a alteração.",
      });
      emailForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar email",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar senha
  const onUpdatePassword = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      passwordForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para excluir conta
  const onDeleteAccount = async (data: z.infer<typeof deleteAccountSchema>) => {
    try {
      setLoading(true);
      
      // Tentar fazer login para validar a senha
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: data.password,
      });

      if (signInError) throw new Error("Senha incorreta");

      // Se o login foi bem-sucedido, excluir usuário
      const { error } = await supabase.rpc('delete_user_account');

      if (error) throw error;

      // Redirecionar para página de login
      await signOut();
      
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir conta",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile?.avatarUrl} alt={profile?.name} />
          <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 text-xl">
            {profile?.name ? getInitials(profile.name) : '--'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>
      </div>

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
              <Form {...personalInfoForm}>
                <form onSubmit={personalInfoForm.handleSubmit(onUpdatePersonalInfo)} className="space-y-4">
                  <FormField
                    control={personalInfoForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={personalInfoForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Como deseja ser chamado</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite como deseja ser chamado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    Salvar Alterações
                  </Button>
                </form>
              </Form>
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
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onUpdateEmail)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite seu novo email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    Atualizar Email
                  </Button>
                </form>
              </Form>
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
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha atual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirme a Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    Alterar Senha
                  </Button>
                </form>
              </Form>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Excluir Conta</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão excluídos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Form {...deleteAccountForm}>
                    <form onSubmit={deleteAccountForm.handleSubmit(onDeleteAccount)} className="space-y-4">
                      <FormField
                        control={deleteAccountForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sua Senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Digite sua senha para confirmar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={deleteAccountForm.control}
                        name="confirmation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirme digitando "excluir minha conta"</FormLabel>
                            <FormControl>
                              <Input placeholder="excluir minha conta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button type="submit" variant="destructive" disabled={loading}>
                            Excluir Permanentemente
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </form>
                  </Form>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
