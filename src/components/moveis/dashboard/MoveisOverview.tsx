import {
  FileText,
  FolderArchive,
  ShoppingCart,
  Sofa,
  TrendingUp,
  Calendar,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MoveisOverviewProps {
  onNavigate: (tab: string) => void;
}

import { MoveisAssistant } from './MoveisAssistant';

export function MoveisOverview({ onNavigate }: MoveisOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Orientações Ativas
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Arquivos no Diretório
            </CardTitle>
            <FolderArchive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">
              +5 esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas O (Mês)
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Foco
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 com vendas hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Área Principal com Dashboard e Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dashboard Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Acesso Rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Acesso Rápido
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Navegue rapidamente pelas funcionalidades mais utilizadas
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover-lift"
                  onClick={() => onNavigate("diretorio")}
                >
                  <FolderArchive className="h-6 w-6" />
                  <span className="text-sm">Diretório</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover-lift"
                  onClick={() => onNavigate("vendao")}
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm">Venda O</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover-lift"
                  onClick={() => onNavigate("produto-foco")}
                >
                  <Star className="h-6 w-6" />
                  <span className="text-sm">Produto Foco</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover-lift"
                  onClick={() => onNavigate("folgas")}
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Folgas</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover-lift"
                  onClick={() => window.open('/hub-produtividade', '_blank')}
                >
                  <Sofa className="h-6 w-6" />
                  <span className="text-sm">Hub</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-2 hover-lift"
                  onClick={() => window.open('/promotional-cards', '_blank')}
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Cards</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova orientação adicionada</p>
                    <p className="text-xs text-muted-foreground">Procedimentos de montagem - Há 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Arquivo carregado no diretório</p>
                    <p className="text-xs text-muted-foreground">Manual_Mesa_Jantar.pdf - Há 4 horas</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Venda O registrada</p>
                    <p className="text-xs text-muted-foreground">Sofá 3 lugares - Filial Centro - Há 6 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chatbot Assistant */}
        <div className="lg:col-span-1">
          <MoveisAssistant />
        </div>
      </div>
    </div>
  );
}
