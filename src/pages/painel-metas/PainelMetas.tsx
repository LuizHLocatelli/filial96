import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Meta = {
  valor: number;
  atingido: number;
};

type MetaDiaria = {
  dia: string;
  meta: Meta;
};

type Consultor = {
  id: number;
  nome: string;
  avatar: string;
  metaMensal: Meta;
  metaSemanal: Meta;
  metasDiarias: MetaDiaria[];
};

type Setor = {
  nome: string;
  metaMensal: Meta;
  consultores: Consultor[];
};

const mockData: Setor[] = [
  {
    nome: "Eletromóveis",
    metaMensal: { valor: 150000, atingido: 85000 },
    consultores: [
      {
        id: 1,
        nome: "Carlos Silva",
        avatar: "/avatars/01.png",
        metaMensal: { valor: 50000, atingido: 28000 },
        metaSemanal: { valor: 12500, atingido: 7000 },
        metasDiarias: [
          { dia: "Seg", meta: { valor: 2500, atingido: 1500 } },
          { dia: "Ter", meta: { valor: 2500, atingido: 2000 } },
          { dia: "Qua", meta: { valor: 2500, atingido: 1800 } },
          { dia: "Qui", meta: { valor: 2500, atingido: 1200 } },
          { dia: "Sex", meta: { valor: 2500, atingido: 500 } },
          { dia: "Sáb", meta: { valor: 0, atingido: 0 } },
        ],
      },
       {
        id: 2,
        nome: "João Oliveira",
        avatar: "/avatars/03.png",
        metaMensal: { valor: 50000, atingido: 35000 },
        metaSemanal: { valor: 12500, atingido: 8000 },
        metasDiarias: [
          { dia: "Seg", meta: { valor: 2500, atingido: 2000 } },
          { dia: "Ter", meta: { valor: 2500, atingido: 2200 } },
          { dia: "Qua", meta: { valor: 2500, atingido: 1500 } },
          { dia: "Qui", meta: { valor: 2500, atingido: 1800 } },
          { dia: "Sex", meta: { valor: 2500, atingido: 500 } },
          { dia: "Sáb", meta: { valor: 0, atingido: 0 } },
        ],
      },
       {
        id: 3,
        nome: "Pedro Martins",
        avatar: "/avatars/04.png",
        metaMensal: { valor: 50000, atingido: 22000 },
        metaSemanal: { valor: 12500, atingido: 4000 },
        metasDiarias: [
          { dia: "Seg", meta: { valor: 2500, atingido: 1000 } },
          { dia: "Ter", meta: { valor: 2500, atingido: 1200 } },
          { dia: "Qua", meta: { valor: 2500, atingido: 800 } },
          { dia: "Qui", meta: { valor: 2500, atingido: 700 } },
          { dia: "Sex", meta: { valor: 2500, atingido: 300 } },
          { dia: "Sáb", meta: { valor: 0, atingido: 0 } },
        ],
      },
    ],
  },
  {
    nome: "Moda",
    metaMensal: { valor: 80000, atingido: 45000 },
    consultores: [
        {
            id: 4,
            nome: "Ana Souza",
            avatar: "/avatars/02.png",
            metaMensal: { valor: 26666, atingido: 15000 },
            metaSemanal: { valor: 6667, atingido: 3750 },
            metasDiarias: [
              { dia: "Seg", meta: { valor: 1333, atingido: 800 } },
              { dia: "Ter", meta: { valor: 1333, atingido: 900 } },
              { dia: "Qua", meta: { valor: 1333, atingido: 1100 } },
              { dia: "Qui", meta: { valor: 1333, atingido: 700 } },
              { dia: "Sex", meta: { valor: 1333, atingido: 250 } },
              { dia: "Sáb", meta: { valor: 0, atingido: 0 } },
            ],
        },
        {
            id: 5,
            nome: "Maria Costa",
            avatar: "/avatars/05.png",
            metaMensal: { valor: 26666, atingido: 18000 },
            metaSemanal: { valor: 6667, atingido: 4500 },
            metasDiarias: [
              { dia: "Seg", meta: { valor: 1333, atingido: 1000 } },
              { dia: "Ter", meta: { valor: 1333, atingido: 1100 } },
              { dia: "Qua", meta: { valor: 1333, atingido: 1200 } },
              { dia: "Qui", meta: { valor: 1333, atingido: 900 } },
              { dia: "Sex", meta: { valor: 1333, atingido: 300 } },
              { dia: "Sáb", meta: { valor: 0, atingido: 0 } },
            ],
        },
        {
            id: 6,
            nome: "Juliana Pereira",
            avatar: "/avatars/06.png",
            metaMensal: { valor: 26666, atingido: 12000 },
            metaSemanal: { valor: 6667, atingido: 2800 },
            metasDiarias: [
              { dia: "Seg", meta: { valor: 1333, atingido: 600 } },
              { dia: "Ter", meta: { valor: 1333, atingido: 700 } },
              { dia: "Qua", meta: { valor: 1333, atingido: 800 } },
              { dia: "Qui", meta: { valor: 1333, atingido: 500 } },
              { dia: "Sex", meta: { valor: 1333, atingido: 200 } },
              { dia: "Sáb", meta: { valor: 0, atingido: 0 } },
            ],
        },
    ],
  },
];

const getProgressColor = (value: number) => {
    if (value < 33) return "bg-red-500";
    if (value < 66) return "bg-yellow-500";
    return "bg-green-500";
};
  

const PainelMetas = () => {
    const [viewMode, setViewMode] = useState<"mensal" | "semanal" | "diario">("mensal");
    const [selectedDay, setSelectedDay] = useState<string>("Seg");

    const getConsultorMeta = (consultor: Consultor): Meta => {
      switch (viewMode) {
        case "semanal":
          return consultor.metaSemanal;
        case "diario":
          return (
            consultor.metasDiarias.find((d) => d.dia === selectedDay)?.meta || {
              valor: 0,
              atingido: 0,
            }
          );
        default:
          return consultor.metaMensal;
      }
    };

    const getSetorMeta = (setor: Setor): Meta => {
      if (viewMode === "mensal") return setor.metaMensal;

      // Agregar valores dos consultores
      let valor = 0;
      let atingido = 0;
      setor.consultores.forEach((c) => {
        const m = getConsultorMeta(c);
        valor += m.valor;
        atingido += m.atingido;
      });
      return { valor, atingido };
    };

    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-background text-foreground">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel de Metas</h1>
            <p className="text-muted-foreground">Acompanhe o desempenho da filial e dos consultores.</p>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-border">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                <TabsList>
                    <TabsTrigger value="mensal">Mensal</TabsTrigger>
                    <TabsTrigger value="semanal">Semanal</TabsTrigger>
                    <TabsTrigger value="diario">Diário</TabsTrigger>
                </TabsList>
            </Tabs>

            {viewMode === 'diario' && (
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Dia:</label>
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Seg">Segunda</SelectItem>
                            <SelectItem value="Ter">Terça</SelectItem>
                            <SelectItem value="Qua">Quarta</SelectItem>
                            <SelectItem value="Qui">Quinta</SelectItem>
                            <SelectItem value="Sex">Sexta</SelectItem>
                            <SelectItem value="Sáb">Sábado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
  
        <section>
          <h2 className="text-2xl font-semibold mb-4">Metas Gerais dos Setores</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockData.map((setor) => (
              <Card key={setor.nome} className="flex flex-col border-border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" />
                    <span>{setor.nome}</span>
                  </CardTitle>
                  <CardDescription>{`Meta ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}`}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center">
                  {(() => {
                    const meta = getSetorMeta(setor);
                    const percent = (meta.atingido / (meta.valor || 1)) * 100;
                    return (
                      <>
                        <div className="text-4xl font-bold text-primary">
                          {`R$ ${meta.atingido.toLocaleString('pt-BR')}`}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          de {`R$ ${meta.valor.toLocaleString('pt-BR')}`}
                        </p>
                        <Progress
                          value={percent}
                          className="mt-4 h-3 bg-secondary"
                          indicatorClassName={getProgressColor(percent)}
                        />
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
  
        <section>
          <h2 className="text-2xl font-semibold mb-4">{`Desempenho Individual (${viewMode === 'mensal' ? 'Mensal' : viewMode === 'semanal' ? 'Semanal' : selectedDay})`}</h2>
          {mockData.map((setor) => (
            <div key={setor.nome} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-primary/80">{setor.nome}</h3>
              <Card className="border-border shadow-sm">
                {/* Tabela em telas médias para cima */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[160px]">Consultor</TableHead>
                        <TableHead>Meta Mensal</TableHead>
                        <TableHead>Meta Semanal</TableHead>
                        <TableHead className="text-center">Progresso Diário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {setor.consultores.map((consultor) => (
                        <TableRow key={consultor.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{consultor.nome}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {(() => {
                                const m = getConsultorMeta(consultor);
                                const p = (m.atingido / (m.valor || 1)) * 100;
                                return (
                                  <>
                                    <span className="font-semibold">{`R$ ${m.atingido.toLocaleString('pt-BR')}`}</span>
                                    <span className="text-xs text-muted-foreground">/ {`R$ ${m.valor.toLocaleString('pt-BR')}`}</span>
                                    <Progress
                                      value={p}
                                      className="h-2 mt-1 bg-secondary"
                                      indicatorClassName={getProgressColor(p)}
                                    />
                                  </>
                                );
                              })()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              {(() => {
                                const m = getConsultorMeta(consultor);
                                const p = (m.atingido / (m.valor || 1)) * 100;
                                return (
                                  <>
                                    <span className="font-semibold">{`R$ ${m.atingido.toLocaleString('pt-BR')}`}</span>
                                    <span className="text-xs text-muted-foreground">/ {`R$ ${m.valor.toLocaleString('pt-BR')}`}</span>
                                    <Progress
                                      value={p}
                                      className="h-2 mt-1 bg-secondary"
                                      indicatorClassName={getProgressColor(p)}
                                    />
                                  </>
                                );
                              })()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-around items-end gap-1 h-16">
                              {consultor.metasDiarias.map((dia) => {
                                  const percentage = dia.meta.valor > 0 ? (dia.meta.atingido / dia.meta.valor) * 100 : 0;
                                  return(
                                  <div key={dia.dia} className="flex flex-col items-center w-10" title={`Atingido: R$ ${dia.meta.atingido.toLocaleString('pt-BR')}\nMeta: R$ ${dia.meta.valor.toLocaleString('pt-BR')}`}> 
                                      <span className="text-[10px]">{dia.meta.atingido}</span>
                                      <div className="w-3 h-full bg-secondary rounded-full overflow-hidden flex flex-col justify-end">
                                          <div className={`${getProgressColor(percentage)} rounded-full`} style={{height: `${Math.min(percentage, 100)}%`}}></div>
                                      </div>
                                      <span className="text-[10px] font-bold mt-1">{dia.dia}</span>
                                  </div>
                              )})}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Versão mobile: cards */}
                <div className="md:hidden p-4 space-y-6">
                  {setor.consultores.map((consultor) => (
                    <div key={consultor.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/25">
                      <div className="font-medium text-sm">{consultor.nome}</div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Meta Mensal</span>
                        <div className="text-xs text-end font-semibold">
                          {(() => {
                            const m = getConsultorMeta(consultor);
                            return (
                              <>
                                {`R$ ${m.atingido.toLocaleString('pt-BR')} / ${m.valor.toLocaleString('pt-BR')}`}
                              </>
                            );
                          })()}
                        </div>
                        {(() => { 
                            const m=getConsultorMeta(consultor); 
                            const p=(m.atingido/(m.valor||1))*100; 
                            return (
                                <Progress value={p} className="h-2 bg-secondary" indicatorClassName={getProgressColor(p)} />
                            );
                        })()}
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground">Meta Semanal</span>
                        <div className="text-xs text-end font-semibold">
                          {(() => {
                            const m = getConsultorMeta(consultor);
                            return (
                              <>
                                {`R$ ${m.atingido.toLocaleString('pt-BR')} / ${m.valor.toLocaleString('pt-BR')}`}
                              </>
                            );
                          })()}
                        </div>
                        {(() => { 
                            const m=getConsultorMeta(consultor); 
                            const p=(m.atingido/(m.valor||1))*100; 
                            return (
                                <Progress value={p} className="h-2 bg-secondary" indicatorClassName={getProgressColor(p)} />
                            );
                        })()}
                      </div>
                      <div className="flex justify-between items-end gap-1 pt-2">
                        {consultor.metasDiarias.map((dia) => {
                          const percentage = dia.meta.valor > 0 ? (dia.meta.atingido / dia.meta.valor) * 100 : 0;
                          return (
                            <div key={dia.dia} className="flex flex-col items-center w-6">
                              <div className="w-2 h-12 bg-secondary rounded-full overflow-hidden flex flex-col justify-end">
                                <div
                                  className={`${getProgressColor(percentage)} rounded-full`}
                                  style={{ height: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold mt-1">{dia.dia}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </section>
  
      </div>
    );
  }

  export default PainelMetas; 