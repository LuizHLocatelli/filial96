// 🎨 Exemplo de Componente usando o Design System Atualizado
// Este é um exemplo demonstrativo de como aplicar os novos padrões

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit3, Trash2, Folder, FolderPlus } from "lucide-react";

interface ExampleItem {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive';
}

export function ExampleComponent() {
  const [items] = useState<ExampleItem[]>([
    { id: '1', title: 'Item 1', description: 'Descrição do item 1', status: 'active' },
    { id: '2', title: 'Item 2', description: 'Descrição do item 2', status: 'inactive' },
    { id: '3', title: 'Item 3', description: 'Descrição do item 3', status: 'active' },
  ]);
  
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 p-6">
      {/* Header com botões padronizados */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Exemplo do Design System
        </h1>
        <div className="flex gap-3">
          <Button variant="outline" size="default">
            <Edit3 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="success" size="default">
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>
      </div>

      {/* Barra de pesquisa melhorada */}
      <Card className="interactive-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar itens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-enhanced pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar com elementos selecionáveis */}
        <div className="lg:col-span-1">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  📁 Categorias
                </span>
                <Button variant="action" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Elemento "Todos" */}
              <div
                className={`selectable-item ${!selectedItem ? 'selected' : ''}`}
                onClick={() => setSelectedItem(null)}
              >
                <FolderPlus className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm">Todos os Itens</span>
              </div>

              {/* Lista de categorias */}
              {['Categoria A', 'Categoria B', 'Categoria C'].map((category, index) => (
                <div
                  key={category}
                  className={`selectable-item ${selectedItem === category ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(category)}
                >
                  <Folder className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{category}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Área principal com cards interativos */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Lista de Itens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="interactive-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium mt-2 ${
                          item.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {item.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Botões de ação no rodapé */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="default">
              Cancelar
            </Button>
            <Button variant="warning" size="default">
              <Edit3 className="h-4 w-4 mr-2" />
              Editar Selecionados
            </Button>
            <Button variant="success" size="default">
              <Plus className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 
🎯 PADRÕES APLICADOS NESTE EXEMPLO:

✅ Button Variants:
- variant="success" para ações principais positivas
- variant="outline" para ações secundárias
- variant="action" para botões pequenos
- variant="warning" para alertas
- variant="destructive" para ações de exclusão

✅ Classes CSS Padronizadas:
- .interactive-card para cards com hover
- .selectable-item para elementos de lista
- .input-enhanced para inputs importantes
- .selected para estado ativo

✅ Layout Responsivo:
- Grid system limpo e organizado
- Espaçamento consistente com space-y-* e gap-*
- Cards com bordas sólidas e sombras suaves

✅ Acessibilidade:
- Touch targets adequados
- Contraste excelente em ambos os modos
- Estados visuais claros

✅ Manutenibilidade:
- Código limpo e bem estruturado
- Componentes reutilizáveis
- Sistema de design consistente
*/ 