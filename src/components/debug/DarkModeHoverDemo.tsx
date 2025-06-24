import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Heart, 
  Star, 
  Settings, 
  Trash2, 
  Download,
  Plus,
  Edit,
  Eye
} from "lucide-react";

export function DarkModeHoverDemo() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">🌙 Demonstração de Hover - Modo Escuro</CardTitle>
          <CardDescription>
            Teste os elementos abaixo no modo escuro para verificar a visibilidade melhorada dos estados hover
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Seção de Botões */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Botões</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Botão Padrão</Button>
              <Button variant="secondary">Botão Secundário</Button>
              <Button variant="outline">Botão Outline</Button>
              <Button variant="ghost">Botão Ghost</Button>
              <Button variant="destructive">Botão Destrutivo</Button>
              <Button variant="success">Botão Sucesso</Button>
              <Button variant="warning">Botão Aviso</Button>
            </div>
          </div>

          {/* Seção de Cards Interativos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cards Interativos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Card Favoritos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Passe o mouse aqui para ver o efeito hover melhorado
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer interactive-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Card Estrelas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Este card usa a classe .interactive-card
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer enhanced-dark-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Card Melhorado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Este card usa .enhanced-dark-hover
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Seção de Elementos de Lista */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Elementos de Lista</h3>
            <div className="space-y-2">
              <div className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <span>Item de Lista 1</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <span>Item de Lista 2</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 border rounded-lg hover:bg-primary/10 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <span>Item de Lista 3 (hover:bg-primary/10)</span>
                  <Badge variant="secondary">Novo</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Formulários */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Elementos de Formulário</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 hover:bg-background transition-colors"
                />
              </div>
              
              <div className="relative">
                <Input 
                  placeholder="Input com hover melhorado" 
                  className="hover:border-primary/40 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Seção de Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Badges e Tags</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="hover:bg-primary/80 cursor-pointer">
                Badge Padrão
              </Badge>
              <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                Badge Secundário
              </Badge>
              <Badge variant="destructive" className="hover:bg-destructive/80 cursor-pointer">
                Badge Destrutivo
              </Badge>
              <Badge variant="outline" className="hover:bg-muted cursor-pointer">
                Badge Outline
              </Badge>
            </div>
          </div>

          {/* Seção de Tabela Simulada */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Elementos de Tabela</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="border-b p-3 bg-muted/50 font-medium">
                Cabeçalho da Tabela
              </div>
              <div className="hover:bg-muted/50 p-3 border-b transition-colors cursor-pointer">
                Linha 1 - Passe o mouse aqui
              </div>
              <div className="hover:bg-primary/10 p-3 border-b transition-colors cursor-pointer">
                Linha 2 - Hover melhorado (hover:bg-primary/10)
              </div>
              <div className="hover:bg-accent/50 p-3 transition-colors cursor-pointer">
                Linha 3 - Hover accent
              </div>
            </div>
          </div>

          {/* Seção de Botões Flutuantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Botões Flutuantes</h3>
            <div className="flex gap-4">
              <Button 
                size="icon" 
                className="hover-lift"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <Button 
                size="icon" 
                className="btn-hover-scale"
                variant="secondary"
              >
                <Heart className="h-4 w-4" />
              </Button>
              
              <Button 
                size="icon" 
                className="enhanced-dark-hover"
                variant="ghost"
              >
                <Star className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instruções */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-200">
                💡 Como Testar
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-300">
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Alterne entre modo claro e escuro usando o botão de tema</li>
                <li>Passe o mouse sobre os elementos acima no modo escuro</li>
                <li>Compare a visibilidade antes e depois das correções</li>
                <li>Teste especialmente os botões ghost, outline e elementos de lista</li>
                <li>Observe as bordas e backgrounds em hover</li>
              </ul>
            </CardContent>
          </Card>

        </CardContent>
      </Card>
    </div>
  );
} 