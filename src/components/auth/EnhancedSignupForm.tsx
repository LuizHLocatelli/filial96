import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User, UserPlus, Shield, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signupSchema, type SignupFormValues } from "./schemas/signupSchema";
import { useSupabaseSignup } from "@/hooks/useSupabaseSignup";

export function EnhancedSignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, signUp } = useSupabaseSignup();
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "gerente",
    },
  });

  const handleSignUp = async (values: SignupFormValues) => {
    const success = await signUp({
      email: values.email,
      password: values.password,
      name: values.name,
      phone: values.phone,
      role: values.role,
    });
    
    if (success) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignUp)}>
        <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Nome completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      {...field}
                      placeholder="Seu nome completo"
                      autoComplete="name"
                      className="pl-10 h-10 sm:h-12 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">E-mail</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className="pl-10 h-10 sm:h-12 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Telefone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                      className="pl-10 h-10 sm:h-12 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      className="pl-10 pr-10 h-10 sm:h-12 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="p-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Função</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 sm:h-12 bg-background/50 border-muted-foreground/20 focus:border-primary transition-all duration-200">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <SelectValue placeholder="Selecione uma função" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="crediarista">Crediarista</SelectItem>
                    <SelectItem value="consultor_moveis">Consultor Móveis</SelectItem>
                    <SelectItem value="consultor_moda">Consultor Moda</SelectItem>
                    <SelectItem value="jovem_aprendiz">Jovem Aprendiz</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full h-10 sm:h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Criando conta...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Criar conta</span>
              </div>
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
