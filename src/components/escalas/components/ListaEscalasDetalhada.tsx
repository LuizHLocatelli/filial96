import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Calendar,
  Key,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import type { Escala } from '../types/escalasTypes';

interface ListaEscalasDetalhadaProps {
  escalas: Escala[];
  onDeletarEscala: (id: string) => Promise<void>;
  modoTeste: boolean;
}

type FiltroTipo = 'todos' | 'trabalho' | 'folga' | 'domingo_trabalhado' | 'feriado_trabalhado';
type OrdenacaoTipo = 'data-asc' | 'data-desc' | 'funcionario-asc' | 'funcionario-desc';

export function ListaEscalasDetalhada({
  escalas,
  onDeletarEscala,
  modoTeste
}: ListaEscalasDetalhadaProps) {
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>('data-asc');

  // Filtrar e ordenar escalas
  const escalasFiltradas = useMemo(() => {
    let resultado = [...escalas];

    // Filtro por texto (busca no nome do funcionário)
    if (filtroTexto) {
      resultado = resultado.filter(e =>
        e.funcionario_nome?.toLowerCase().includes(filtroTexto.toLowerCase())
      );
    }

    // Filtro por tipo
    if (filtroTipo !== 'todos') {
      resultado = resultado.filter(e => e.tipo === filtroTipo);
    }

    // Ordenação
    resultado.sort((a, b) => {
      switch (ordenacao) {
        case 'data-asc':
          return a.data.localeCompare(b.data);
        case 'data-desc':
          return b.data.localeCompare(a.data);
        case 'funcionario-asc':
          return (a.funcionario_nome || '').localeCompare(b.funcionario_nome || '');
        case 'funcionario-desc':
          return (b.funcionario_nome || '').localeCompare(a.funcionario_nome || '');
        default:
          return 0;
      }
    });

    return resultado;
  }, [escalas, filtroTexto, filtroTipo, ordenacao]);

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'trabalho': return 'Trabalho';
      case 'folga': return 'Folga';
      case 'domingo_trabalhado': return 'Domingo Trabalhado';
      case 'feriado_trabalhado': return 'Feriado Trabalhado';
      default: return tipo;
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'folga': return 'destructive';
      case 'domingo_trabalhado': return 'default';
      case 'feriado_trabalhado': return 'secondary';
      default: return 'outline';
    }
  };

  // Estatísticas
  const stats = useMemo(() => {
    return {
      total: escalas.length,
      trabalho: escalas.filter(e => e.tipo === 'trabalho').length,
      folgas: escalas.filter(e => e.tipo === 'folga').length,
      domingos: escalas.filter(e => e.tipo === 'domingo_trabalhado').length,
      feriados: escalas.filter(e => e.tipo === 'feriado_trabalhado').length,
      aberturas: escalas.filter(e => e.eh_abertura).length,
      funcionariosUnicos: new Set(escalas.map(e => e.funcionario_id)).size
    };
  }, [escalas]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lista Detalhada de Escalas
              {modoTeste && (
                <Badge variant="outline" className="ml-2">Modo Teste</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Visualização completa de todas as escalas do mês
            </CardDescription>
          </div>
        </div>

        {/* Estatísticas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Funcionários</div>
            <div className="text-2xl font-bold">{stats.funcionariosUnicos}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Trabalho</div>
            <div className="text-2xl font-bold">{stats.trabalho}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Folgas</div>
            <div className="text-2xl font-bold text-red-600">{stats.folgas}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Domingos</div>
            <div className="text-2xl font-bold text-blue-600">{stats.domingos}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Feriados</div>
            <div className="text-2xl font-bold text-orange-600">{stats.feriados}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground mb-1">Aberturas</div>
            <div className="text-2xl font-bold text-purple-600">{stats.aberturas}</div>
          </Card>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por funcionário..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as FiltroTipo)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="trabalho">Trabalho</SelectItem>
              <SelectItem value="folga">Folga</SelectItem>
              <SelectItem value="domingo_trabalhado">Domingo Trabalhado</SelectItem>
              <SelectItem value="feriado_trabalhado">Feriado Trabalhado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as OrdenacaoTipo)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data-asc">Data (Crescente)</SelectItem>
              <SelectItem value="data-desc">Data (Decrescente)</SelectItem>
              <SelectItem value="funcionario-asc">Funcionário (A-Z)</SelectItem>
              <SelectItem value="funcionario-desc">Funcionário (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        {escalasFiltradas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhuma escala encontrada</p>
            <p className="text-sm">
              {escalas.length === 0
                ? 'Crie uma nova escala para começar'
                : 'Tente ajustar os filtros de busca'
              }
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalhes</TableHead>
                    <TableHead>Observação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escalasFiltradas.map((escala) => (
                    <TableRow key={escala.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-semibold">
                              {format(parseISO(escala.data), 'dd/MM/yyyy')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(parseISO(escala.data), 'EEEE', { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{escala.funcionario_nome || 'Funcionário'}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={getTipoBadgeVariant(escala.tipo)}>
                          {getTipoLabel(escala.tipo)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {escala.eh_abertura && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Key className="h-3 w-3 mr-1" />
                              Abertura
                            </Badge>
                          )}
                          {escala.folga_compensatoria_id && (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              ✓ Folga vinculada
                            </Badge>
                          )}
                          {(escala.tipo === 'domingo_trabalhado' || escala.tipo === 'feriado_trabalhado') &&
                           !escala.folga_compensatoria_id && (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              ⚠ Sem folga
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-[200px]">
                        {escala.observacao ? (
                          <div className="text-sm text-muted-foreground truncate" title={escala.observacao}>
                            {escala.observacao}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeletarEscala(escala.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}

        {/* Rodapé com contadores */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Mostrando <strong>{escalasFiltradas.length}</strong> de <strong>{escalas.length}</strong> escalas
          </div>
          {(filtroTexto || filtroTipo !== 'todos') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFiltroTexto('');
                setFiltroTipo('todos');
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
