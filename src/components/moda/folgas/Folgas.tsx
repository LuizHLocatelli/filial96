import { PlusCircle, Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";
import { isSameMonth, addDays } from "date-fns";
import { useFolgas } from "@/hooks/shared/useFolgas";
import { FolgasCalendar, FolgasList, FolgasSummary, AddFolgaDialog } from "@/components/shared/folgas";
import { UseFolgasConfig } from "@/types/shared/folgas";

// Configuração específica para o módulo de Moda
const modaFolgasConfig: UseFolgasConfig = {
  tableName: "moda_folgas",
  consultantRole: "consultor_moda",
  moduleTitle: "Folgas",
  moduleDescription: "Gerenciamento de folgas dos consultores de moda",
};

export function Folgas() {
  const {
    currentMonth,
    consultores,
    isLoadingConsultores,
    isLoadingFolgas,
    folgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedConsultor,
    setSelectedConsultor,
    motivo,
    setMotivo,
    handlePrevMonth,
    handleNextMonth,
    handleAddFolga,
    handleDeleteFolga,
    getConsultorById,
    getUserNameById,
    folgasDoDiaSelecionado,
    handleDateClick,
    refetchFolgas,
  } = useFolgas(modaFolgasConfig);

  const getConsultorName = (id: string): string | undefined => {
    return getConsultorById(id)?.nome;
  };

  // Estatísticas gerais
  const estatisticasGerais = useMemo(() => {
    const folgasThisMonth = folgas.filter((folga) => isSameMonth(new Date(folga.data), currentMonth));

    const hoje = new Date();
    const proximos7Dias = folgas.filter((folga) => {
      const folgaDate = new Date(folga.data);
      const em7Dias = addDays(hoje, 7);
      return folgaDate >= hoje && folgaDate <= em7Dias;
    });

    const consultoresComFolgaNoMes = new Set(folgasThisMonth.map((f) => f.consultorId)).size;

    return {
      totalFolgasNoMes: folgasThisMonth.length,
      proximasFolgas: proximos7Dias.length,
      consultoresComFolga: consultoresComFolgaNoMes,
      totalConsultores: consultores.length,
    };
  }, [folgas, currentMonth, consultores]);

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{modaFolgasConfig.moduleTitle}</h2>
          <p className="text-sm text-muted-foreground">{modaFolgasConfig.moduleDescription}</p>
        </div>
        <Button
          onClick={() => {
            handleDateClick(selectedDate || new Date());
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Folga
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid-responsive-stats">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Folgas no Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingFolgas ? "..." : estatisticasGerais.totalFolgasNoMes}</div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas 7 Dias</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingFolgas ? "..." : estatisticasGerais.proximasFolgas}</div>
            <p className="text-xs text-muted-foreground">Folgas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingConsultores
                ? "..."
                : `${estatisticasGerais.consultoresComFolga}/${estatisticasGerais.totalConsultores}`}
            </div>
            <p className="text-xs text-muted-foreground">Com folgas no mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Folgas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingConsultores || isLoadingFolgas
                ? "..."
                : estatisticasGerais.totalConsultores > 0
                  ? `${Math.round((estatisticasGerais.consultoresComFolga / estatisticasGerais.totalConsultores) * 100)}%`
                  : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Do total de consultores</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <FolgasCalendar
          currentMonth={currentMonth}
          folgas={folgas}
          handlePrevMonth={handlePrevMonth}
          handleNextMonth={handleNextMonth}
          onDateClick={handleDateClick}
          getConsultorById={getConsultorById}
          title="Calendário de Folgas"
          description="Clique em um dia para adicionar ou visualizar detalhes das folgas."
        />

        <div className="mt-8">
          <FolgasList
            folgas={folgas}
            handleDeleteFolga={handleDeleteFolga}
            getConsultorById={getConsultorById}
            getUserNameById={getUserNameById}
            isLoading={isLoadingFolgas}
            title="Lista de Folgas"
            description="Gerencie todas as folgas registradas dos consultores de moda"
          />
        </div>
      </div>

      <AddFolgaDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        consultores={consultores}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedConsultor={selectedConsultor}
        setSelectedConsultor={setSelectedConsultor}
        motivo={motivo}
        setMotivo={setMotivo}
        handleAddFolga={handleAddFolga}
        isLoading={isLoadingConsultores}
        folgasNoDia={folgasDoDiaSelecionado}
        getConsultorNameById={getConsultorName}
        getUserNameForFolga={getUserNameById}
        title="Adicionar Folga"
        description="Registre uma nova folga para um consultor de moda"
      />

      <FolgasSummary
        folgas={folgas}
        isLoading={isLoadingFolgas}
        currentMonth={currentMonth}
        getConsultorById={getConsultorById}
      />
    </div>
  );
}
