import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Star,
  Keyboard,
  BarChart3,
  Heart,
  Trash2,
  Info,
  Move
} from 'lucide-react';
import { useQuickActionPreferences } from '../../hooks/useQuickActionPreferences';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface QuickActionsSettingsProps {
  handlers: any;
}

export function QuickActionsSettings({ handlers }: QuickActionsSettingsProps) {
  const [open, setOpen] = useState(false);
  const {
    preferences,
    toggleFavorite,
    isFavorite,
    toggleShowOnlyFavorites,
    toggleKeyboardShortcuts,
    resetPreferences,
    getMostUsedActions
  } = useQuickActionPreferences();
  
  const { getShortcutsList } = useKeyboardShortcuts(handlers, preferences.enableKeyboardShortcuts);

  const actions = [
    { id: 'nova-rotina', title: 'Nova Rotina', description: 'Criar nova rotina obrigatória' },
    { id: 'nova-orientacao', title: 'Nova Orientação', description: 'Adicionar VM ou informativo' },
    { id: 'nova-tarefa', title: 'Nova Tarefa', description: 'Criar nova tarefa' },
    { id: 'busca-avancada', title: 'Busca Avançada', description: 'Buscar com filtros' },
    { id: 'filtros-data', title: 'Por Data', description: 'Filtros temporais' },
    { id: 'relatorios', title: 'Relatórios', description: 'Analytics e métricas' },
    { id: 'ver-rotinas', title: 'Ver Rotinas', description: 'Acessar todas rotinas' },
    { id: 'ver-orientacoes', title: 'Ver Orientações', description: 'Acessar informativos' },
    { id: 'monitoramento', title: 'Monitoramento', description: 'Ver acompanhamento' },
    { id: 'filtros', title: 'Filtros', description: 'Aplicar filtros' },
    { id: 'atualizar', title: 'Atualizar', description: 'Recarregar dados' },
    { id: 'exportar', title: 'Exportar', description: 'Baixar relatórios' }
  ];

  const mostUsedActions = getMostUsedActions(5);
  const shortcuts = getShortcutsList();

  const handleResetPreferences = () => {
    if (confirm('Tem certeza que deseja resetar todas as preferências? Esta ação não pode ser desfeita.')) {
      resetPreferences();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Configurar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações das Ações Rápidas
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Atalhos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Gerenciar Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-only-favorites"
                    checked={preferences.showOnlyFavorites}
                    onCheckedChange={toggleShowOnlyFavorites}
                  />
                  <Label htmlFor="show-only-favorites">
                    Mostrar apenas ações favoritas
                  </Label>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {actions.map((action) => (
                    <Card key={action.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{action.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {action.description}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(action.id)}
                            className={`ml-2 ${isFavorite(action.id) ? 'text-yellow-500' : 'text-muted-foreground'}`}
                          >
                            <Star className={`h-4 w-4 ${isFavorite(action.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Keyboard className="h-5 w-5" />
                  Atalhos de Teclado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-shortcuts"
                    checked={preferences.enableKeyboardShortcuts}
                    onCheckedChange={toggleKeyboardShortcuts}
                  />
                  <Label htmlFor="enable-shortcuts">
                    Habilitar atalhos de teclado
                  </Label>
                </div>
                
                {preferences.enableKeyboardShortcuts && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Atalhos Disponíveis:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {shortcuts.map((shortcut, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <span className="text-sm">{shortcut.description}</span>
                            <Badge variant="outline" className="font-mono text-xs">
                              {shortcut.combination}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Estatísticas de Uso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mostUsedActions.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-medium">Ações Mais Utilizadas:</h4>
                    <div className="space-y-2">
                      {mostUsedActions.map((stat, index) => {
                        const action = actions.find(a => a.id === stat.actionId);
                        return (
                          <div key={stat.actionId} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                                {index + 1}
                              </Badge>
                              <span className="font-medium">{action?.title}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">{stat.count} vezes</div>
                              <div className="text-xs text-muted-foreground">
                                Última vez: {new Date(stat.lastUsed).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado de uso disponível ainda.</p>
                    <p className="text-sm">Use as ações rápidas para ver estatísticas aqui.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Informações:</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>Total de ações favoritas: {preferences.favorites.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Keyboard className="h-4 w-4" />
                      <span>Atalhos de teclado: {preferences.enableKeyboardShortcuts ? 'Habilitados' : 'Desabilitados'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Ações rastreadas: {Object.keys(preferences.usageStats).length}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-destructive">Zona de Perigo:</h4>
                  <Button 
                    variant="destructive" 
                    onClick={handleResetPreferences}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Resetar Todas as Preferências
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Esta ação irá apagar todos os favoritos, estatísticas e configurações.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 