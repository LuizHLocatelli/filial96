import { useState, useEffect } from 'react';
import { Shield, Crown, GraduationCap, Truck, UserCircle, Save, Loader2 } from 'lucide-react';
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserRole } from '@/types';

// O gerente não precisa ser configurado pois tem acesso ['*'] por padrão no hook
const ROLES: { id: UserRole, label: string, icon: any }[] = [
  { id: 'consultor_moveis', label: 'Consultor de Móveis', icon: UserCircle },
  { id: 'consultor_moda', label: 'Consultor de Moda', icon: UserCircle },
  { id: 'crediarista', label: 'Crediarista', icon: Shield },
  { id: 'jovem_aprendiz', label: 'Jovem Aprendiz', icon: GraduationCap },
  { id: 'freteiro', label: 'Freteiro', icon: Truck },
];

const AVAILABLE_TOOLS = [
  { id: 'hub', label: 'Hub Produtividade', category: 'Geral', description: 'Acesso à página inicial e ferramentas gerais' },
  { id: 'cards', label: 'Cards Promocionais', category: 'Geral', description: 'Criação e edição de cards promocionais' },
  
  { id: 'moveis', label: 'Móveis (Aba Principal)', category: 'Móveis', description: 'Acesso ao setor de móveis' },
  { id: 'moveis_fretes', label: 'Fretes', category: 'Móveis', description: 'Calculadora e gestão de fretes' },
  { id: 'moveis_orcamentos', label: 'Orçamentos', category: 'Móveis', description: 'Geração de orçamentos em PDF' },
  { id: 'moveis_ssc', label: 'Procedimentos SSC', category: 'Móveis', description: 'Guia de assistência técnica' },
  
  { id: 'moda', label: 'Moda (Aba Principal)', category: 'Moda', description: 'Acesso ao setor de moda' },
  
  { id: 'crediario', label: 'Crediário (Aba Principal)', category: 'Crediário', description: 'Acesso ao setor de crediário' },
];

export default function RolePermissions() {
  const { profile } = useAuth();
  const [activeRole, setActiveRole] = useState<UserRole>('consultor_moveis');
  const [permissions, setPermissions] = useState<Record<UserRole, string[]>>({} as Record<UserRole, string[]>);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Verifica se é gerente
  const isManager = profile?.role === 'gerente';

  useEffect(() => {
    if (isManager) {
      loadPermissions();
    }
  }, [isManager]);

  const loadPermissions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;

      const permsMap = {} as Record<UserRole, string[]>;
      data.forEach(row => {
        permsMap[row.role as UserRole] = row.allowed_tools;
      });
      setPermissions(permsMap);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Erro ao carregar permissões');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePermission = (toolId: string, checked: boolean) => {
    setPermissions(prev => {
      const rolePerms = prev[activeRole] || [];
      
      let newPerms;
      if (checked) {
        newPerms = [...rolePerms, toolId];
        
        // Auto-enable parent tabs
        if (toolId.startsWith('moveis_') && !newPerms.includes('moveis')) {
          newPerms.push('moveis');
        }
      } else {
        newPerms = rolePerms.filter(id => id !== toolId);
        
        // Auto-disable children if parent is disabled
        if (toolId === 'moveis') {
          newPerms = newPerms.filter(id => !id.startsWith('moveis_'));
        }
      }
      
      return { ...prev, [activeRole]: newPerms };
    });
  };

  const savePermissions = async () => {
    setIsSaving(true);
    try {
      const currentPerms = permissions[activeRole] || [];
      
      const { error } = await supabase
        .from('role_permissions')
        .upsert({ 
          role: activeRole, 
          allowed_tools: currentPerms 
        }, { onConflict: 'role' });

      if (error) throw error;
      
      toast.success('Permissões salvas com sucesso!');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Erro ao salvar permissões');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isManager) {
    return (
      <PageLayout maxWidth="md" spacing="normal">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold">Acesso Restrito</h3>
                <p className="text-muted-foreground">
                  Esta funcionalidade está disponível apenas para gerentes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Agrupar ferramentas por categoria
  const categories = Array.from(new Set(AVAILABLE_TOOLS.map(t => t.category)));
  const activeRolePermissions = permissions[activeRole] || [];
  const hasFullAccess = activeRolePermissions.includes('*');

  return (
    <PageLayout maxWidth="lg" spacing="normal">
      <PageHeader
        title="Controle de Acessos"
        description="Gerencie quais ferramentas cada cargo pode acessar no sistema"
        icon={Shield}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Controle de Acessos" }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
        {/* Menu lateral de cargos */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Cargos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isActive = activeRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => setActiveRole(role.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left
                      ${isActive 
                        ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' 
                        : 'hover:bg-muted text-muted-foreground'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {role.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Área principal de permissões */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const Icon = ROLES.find(r => r.id === activeRole)?.icon || UserCircle;
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              <CardTitle>
                Permissões para {ROLES.find(r => r.id === activeRole)?.label}
              </CardTitle>
            </div>
            <CardDescription>
              Ative ou desative o acesso às ferramentas abaixo para todos os usuários com este cargo.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : hasFullAccess ? (
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-muted-foreground">
                  Este cargo possui acesso total a todas as ferramentas (permissão '*').
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map(category => (
                  <div key={category} className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b pb-2">
                      {category}
                    </h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      {AVAILABLE_TOOLS.filter(t => t.category === category).map(tool => {
                        const isChecked = activeRolePermissions.includes(tool.id);
                        
                        // Disable child checkboxes if parent is not checked
                        let isDisabled = false;
                        if (tool.id.startsWith('moveis_') && tool.id !== 'moveis' && !activeRolePermissions.includes('moveis')) {
                          isDisabled = true;
                        }

                        return (
                          <div 
                            key={tool.id} 
                            className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors
                              ${isChecked ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'}
                              ${isDisabled ? 'opacity-50 grayscale' : ''}
                            `}
                          >
                            <Switch 
                              id={`switch-${tool.id}`} 
                              checked={isChecked}
                              onCheckedChange={(c) => handleTogglePermission(tool.id, c)}
                              disabled={isDisabled}
                              className="mt-1"
                            />
                            <div className="space-y-1">
                              <Label 
                                htmlFor={`switch-${tool.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {tool.label}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <Button 
              onClick={savePermissions} 
              disabled={isLoading || isSaving || hasFullAccess}
              className="w-full sm:w-auto ml-auto gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Permissões'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  );
}
