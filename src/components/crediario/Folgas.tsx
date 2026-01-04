import { useState, useMemo } from "react";
import { PlusCircle, Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isSameMonth, addDays } from "date-fns";
import { useFolgas } from "@/hooks/shared/useFolgas";
import { FolgasCalendar, FolgasList, FolgasSummary, AddFolgaDialog } from "@/components/shared/folgas";
import { UseFolgasConfig, Consultor } from "@/types/shared/folgas";
import { ImagePreviewDialog } from "./folgas/ImagePreviewDialog";

// Configuração específica para o módulo de Crediário
const crediarioFolgasConfig: UseFolgasConfig = {
  tableName: "crediario_folgas",
  consultantRole: "crediarista",
  moduleTitle: "Folgas",
  moduleDescription: "Gerenciamento de folgas dos crediaristas",
};

// Tipo específico para crediario (renomeado de Consultor)
interface Crediarista extends Consultor {
  // pode ter campos adicionais específicos
}

export function Folgas() {
  const [viewImage, setViewImage] = useState<string | null>(null);

  const {
    currentMonth,
    consultores: crediaristas,
    isLoadingConsultores: isLoadingCrediaristas,
    isLoadingFolgas,
    folgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedConsultor: selectedCrediarista,
    setSelectedConsultor: setSelectedCrediarista,
    motivo,
    setMotivo,
    handlePrevMonth,
    handleNextMonth,
    handleAddFolga,
    handleDeleteFolga,
    getConsultorById: getCrediaristaById,
    getUserNameById,
    folgasDoDiaSelecionado,
    handleDateClick,
  } = useFolgas(crediarioFolgasConfig);

  // Wrapper para obter apenas o nome do crediarista
  const getCrediaristaName = (id: string): string | undefined => {
    return getCrediaristaById(id)?.nome;
  };

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const folgasThisMonth = folgas.filter((folga) => isSameMonth(new Date(folga.data), currentMonth));

    const hoje = new Date();
    const proximos7Dias = folgas.filter((folga) => {
      const folgaDate = new Date(folga.data);
      const em7Dias = addDays(hoje, 7);
      return folgaDate >= hoje && folgaDate <= em7Dias;
    });

    const crediariastasComFolgaNoMes = new Set(folgasThisMonth.map((f) => f.consultorId)).size;

    return {
      totalFolgasNoMes: folgasThisMonth.length,
      proximasFolgas: proximos7Dias.length,
      crediariastasComFolga: crediariastasComFolgaNoMes,
      totalCrediaristas: crediaristas.length,
    };
  }, [folgas, currentMonth, crediaristas]);

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">{crediarioFolgasConfig.moduleTitle}</h2>
          <p className="text-sm text-muted-foreground">{crediarioFolgasConfig.moduleDescription}</p>
        </div>
        <Button onClick={() => handleDateClick(selectedDate || new Date())}>
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
            <div className="text-2xl font-bold">{isLoadingFolgas ? "..." : estatisticas.totalFolgasNoMes}</div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas 7 Dias</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingFolgas ? "..." : estatisticas.proximasFolgas}</div>
            <p className="text-xs text-muted-foreground">Folgas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crediaristas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCrediaristas
                ? "..."
                : `${estatisticas.crediariastasComFolga}/${estatisticas.totalCrediaristas}`}
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
              {isLoadingCrediaristas || isLoadingFolgas
                ? "..."
                : estatisticas.totalCrediaristas > 0
                  ? `${Math.round((estatisticas.crediariastasComFolga / estatisticas.totalCrediaristas) * 100)}%`
                  : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">Do total de crediaristas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid-responsive-cards lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FolgasCalendar
            currentMonth={currentMonth}
            folgas={folgas}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            onDateClick={handleDateClick}
            getConsultorById={getCrediaristaById}
            title="Calendário de Folgas"
            description="Clique em um dia para adicionar ou visualizar detalhes das folgas."
          />
        </div>

        <div>
          <FolgasList
            folgas={folgas}
            handleDeleteFolga={handleDeleteFolga}
            getConsultorById={getCrediaristaById}
            getUserNameById={getUserNameById}
            isLoading={isLoadingFolgas}
            title="Folgas Recentes"
            description="Últimas folgas registradas dos crediaristas"
          />
        </div>
      </div>

      <AddFolgaDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        consultores={crediaristas}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedConsultor={selectedCrediarista}
        setSelectedConsultor={setSelectedCrediarista}
        motivo={motivo}
        setMotivo={setMotivo}
        handleAddFolga={handleAddFolga}
        isLoading={isLoadingCrediaristas}
        folgasNoDia={folgasDoDiaSelecionado}
        getConsultorNameById={getCrediaristaName}
        getUserNameForFolga={getUserNameById}
        title="Adicionar Folga"
        description="Registre uma nova folga para um crediarista"
      />

      <FolgasSummary
        folgas={folgas}
        isLoading={isLoadingFolgas}
        currentMonth={currentMonth}
        getConsultorById={getCrediaristaById}
      />

      <ImagePreviewDialog viewImage={viewImage} setViewImage={setViewImage} />
    </div>
  );
}
