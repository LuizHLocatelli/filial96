# Guia de Refatoração - Sistema de Design

## 🎯 Objetivo
Este guia fornece instruções passo-a-passo para refatorar páginas existentes e alinhá-las com o sistema de design padronizado.

## 📋 Checklist de Refatoração

### Antes de Começar
- [ ] Fazer backup da página atual
- [ ] Identificar funcionalidades existentes
- [ ] Listar componentes utilizados
- [ ] Verificar dependências

### 1. Estrutura de Layout

#### ✅ Implementar PageLayout
```tsx
// ❌ ANTES
export default function MinhaPage() {
  return (
    <div className="container mx-auto p-4">
      {/* conteúdo */}
    </div>
  );
}

// ✅ DEPOIS
import { PageLayout } from "@/components/layout/PageLayout";

export default function MinhaPage() {
  return (
    <PageLayout spacing="normal" maxWidth="full">
      {/* conteúdo */}
    </PageLayout>
  );
}
```

#### ✅ Implementar PageHeader
```tsx
// ❌ ANTES
<div className="mb-6">
  <h1 className="text-2xl font-bold">Título da Página</h1>
  <p className="text-gray-600">Descrição da página</p>
</div>

// ✅ DEPOIS
import { PageHeader } from "@/components/layout/PageHeader";
import { IconName } from "@/components/ui/emoji-icons";

<PageHeader
  title="Título da Página"
  description="Descrição clara da funcionalidade"
  icon={IconName}
  iconColor="text-primary"
  variant="default"
  breadcrumbs={[
    { label: "Hub de Produtividade", href: "/" },
    { label: "Título da Página" }
  ]}
/>
```

### 2. Sistema de Navegação por Tabs

#### ✅ Implementar PageNavigation
```tsx
// ❌ ANTES
const [activeTab, setActiveTab] = useState("tab1");

<div className="flex space-x-4 mb-6">
  <button 
    onClick={() => setActiveTab("tab1")}
    className={activeTab === "tab1" ? "active" : ""}
  >
    Tab 1
  </button>
  {/* mais tabs */}
</div>

// ✅ DEPOIS
import { useSearchParams } from "react-router-dom";
import { PageNavigation } from "@/components/layout/PageNavigation";

const [searchParams, setSearchParams] = useSearchParams();
const activeTab = searchParams.get("tab") || "tab1";

const handleTabChange = (value: string) => {
  setSearchParams({ tab: value });
};

const tabsConfig = [
  {
    value: "tab1",
    label: "Tab 1",
    icon: IconName,
    description: "Descrição da tab",
    component: <ComponenteTab1 />
  }
  // mais tabs...
];

<PageNavigation
  tabs={tabsConfig}
  activeTab={activeTab}
  onTabChange={handleTabChange}
  variant="cards"
  maxColumns={4}
/>
```

### 3. Sistema de Cards

#### ✅ Padronizar Cards
```tsx
// ❌ ANTES
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold mb-2">Título</h3>
  <p className="text-gray-600">Conteúdo</p>
</div>

// ✅ DEPOIS
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card glassmorphism={true} variant="glass">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo</p>
  </CardContent>
</Card>
```

### 4. Sistema de Botões

#### ✅ Padronizar Botões
```tsx
// ❌ ANTES
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Ação
</button>

// ✅ DEPOIS
import { Button } from "@/components/ui/button";

<Button variant="default" size="default">
  Ação
</Button>

// Variantes disponíveis:
// variant: "default" | "secondary" | "outline" | "ghost" | "destructive"
// size: "sm" | "default" | "lg" | "icon"
```

### 5. Cores e Ícones

#### ✅ Padronizar Sistema de Cores
```tsx
// ❌ ANTES
<Icon className="text-blue-500" />
<div className="bg-blue-100 border-blue-300">

// ✅ DEPOIS
<Icon className="text-primary" />
<div className="bg-primary/10 border-primary/20">
```

#### ✅ Ícones Sempre Verdes
```tsx
// Todos os ícones devem usar text-primary ou variações de verde
<Icon className="text-primary" />
<Icon className="text-green-600" />
<Icon className="text-emerald-500" />
```

## 🔧 Exemplos Práticos de Refatoração

### Exemplo 1: Página com Tabs Simples

#### ANTES:
```tsx
export default function MinhaPage() {
  const [activeTab, setActiveTab] = useState("tab1");
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Minha Página
        </h1>
        <p className="text-gray-600">
          Descrição da página
        </p>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setActiveTab("tab1")}
          className={`px-4 py-2 rounded ${
            activeTab === "tab1" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200"
          }`}
        >
          Primeira Tab
        </button>
        <button 
          onClick={() => setActiveTab("tab2")}
          className={`px-4 py-2 rounded ${
            activeTab === "tab2" 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200"
          }`}
        >
          Segunda Tab
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === "tab1" && <ComponenteTab1 />}
        {activeTab === "tab2" && <ComponenteTab2 />}
      </div>
    </div>
  );
}
```

#### DEPOIS:
```tsx
import { useSearchParams } from "react-router-dom";
import { FileText, Users } from "@/components/ui/emoji-icons";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageNavigation } from "@/components/layout/PageNavigation";

export default function MinhaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "tab1";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  const tabsConfig = [
    {
      value: "tab1",
      label: "Primeira Tab",
      icon: FileText,
      description: "Descrição da primeira tab",
      component: <ComponenteTab1 />
    },
    {
      value: "tab2",
      label: "Segunda Tab", 
      icon: Users,
      description: "Descrição da segunda tab",
      component: <ComponenteTab2 />
    }
  ];

  return (
    <PageLayout spacing="normal" maxWidth="full">
      <PageHeader
        title="Minha Página"
        description="Descrição clara da funcionalidade"
        icon={FileText}
        iconColor="text-primary"
        variant="default"
        breadcrumbs={[
          { label: "Hub de Produtividade", href: "/" },
          { label: "Minha Página" }
        ]}
      />

      <PageNavigation
        tabs={tabsConfig}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        variant="cards"
        maxColumns={2}
      />
    </PageLayout>
  );
}
```

## 🎨 Padrões Específicos

### 1. Responsividade Mobile
```tsx
// Sempre usar hook useIsMobile para ajustes específicos
import { useIsMobile } from "@/hooks/use-mobile";

const isMobile = useIsMobile();

// Aplicar classes condicionais
className={cn(
  "base-classes",
  isMobile ? "mobile-classes" : "desktop-classes"
)}
```

### 2. Animações
```tsx
// Usar motion.div para animações suaves
import { motion } from "framer-motion";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  {/* conteúdo */}
</motion.div>
```

### 3. Estados de Loading
```tsx
// Usar componentes padronizados
import { Skeleton } from "@/components/ui/skeleton";

{loading ? (
  <Skeleton className="h-4 w-full" />
) : (
  <div>Conteúdo carregado</div>
)}
```

## ⚠️ Problemas Comuns e Soluções

### 1. Arquivos Muito Grandes
```
❌ Problema: Arquivo com +500 linhas
✅ Solução: Quebrar em módulos menores

// Estrutura sugerida:
MinhaPage.tsx (< 200 linhas)
├── components/
│   ├── ComponenteA.tsx
│   ├── ComponenteB.tsx
│   └── ComponenteC.tsx
├── hooks/
│   └── useMinhaPageData.ts
└── types.ts
```

### 2. Cores Inconsistentes
```tsx
// ❌ Evitar
className="text-blue-500 bg-red-100"

// ✅ Usar
className="text-primary bg-primary/10"
```

### 3. Layout Quebrado em Mobile
```tsx
// ❌ Evitar classes que causam overflow
className="flex space-x-8 px-8"

// ✅ Usar
className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 px-3 sm:px-6"
```

## 📝 Processo de Refatoração Recomendado

### 1. Análise (30 min)
- Entender funcionalidade atual
- Identificar componentes únicos
- Mapear fluxos de navegação

### 2. Planejamento (15 min)
- Definir estrutura de módulos
- Escolher ícones e cores
- Planejar responsividade

### 3. Implementação (2-4 horas)
- Implementar estrutura base (PageLayout, PageHeader)
- Migrar componentes para padrão
- Ajustar cores e espaçamentos
- Implementar responsividade

### 4. Testes (30 min)
- Testar em desktop e mobile
- Verificar todas as funcionalidades
- Validar navegação e estados

### 5. Review (15 min)
- Verificar checklist de padronização
- Confirmar menos de 200 linhas por arquivo
- Validar acessibilidade básica

## 🎯 Resultado Esperado

Após a refatoração, cada página deve:
- ✅ Seguir estrutura padrão com PageLayout, PageHeader, PageNavigation
- ✅ Usar sistema de cores verde consistente
- ✅ Ter responsividade mobile adequada
- ✅ Arquivos com menos de 200 linhas cada
- ✅ Componentes UI padronizados (Card, Button, etc.)
- ✅ Animações suaves
- ✅ Navegação por URL com searchParams

---

**Próximo passo**: Escolher primeira página para refatoração e aplicar este guia! 