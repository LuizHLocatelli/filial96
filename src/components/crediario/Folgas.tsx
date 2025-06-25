import { AddFolgaDialog } from "./folgas/AddFolgaDialog";
import { ImagePreviewDialog } from "./folgas/ImagePreviewDialog";
import { useFolgas } from "./folgas/useFolgas";
import { FolgasHeader } from "./folgas/components/FolgasHeader";
import { FolgasStatistics } from "./folgas/components/FolgasStatistics";
import { FolgasContent } from "./folgas/components/FolgasContent";
import { useMemo } from "react";
import { startOfMonth, endOfMonth, isSameMonth, addDays } from "date-fns";

export function Folgas() {
  const {
    currentMonth,
    crediaristas,
    isLoadingCrediaristas,
    folgas,
    isLoadingFolgas,
    openDialog,
    setOpenDialog,
    selectedDate,
    setSelectedDate,
    selectedCrediarista,
    setSelectedCrediarista,
    motivo,
    setMotivo,
    viewImage,
    setViewImage,
    handlePrevMonth,
    handleNextMonth,
    handleAddFolga,
    handleDeleteFolga,
    getCrediaristaById,
    getUserNameById,
    weeks,
    allUsers,
    isLoadingUsers,
    folgasDoDiaSelecionado,
    handleDateClick,
  } = useFolgas();
  
  // Wrapper para obter apenas o nome do crediarista
  const getCrediaristaName = (id: string): string | undefined => {
    return getCrediaristaById(id)?.nome;
  };

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    const folgasThisMonth = folgas.filter(folga => 
      isSameMonth(new Date(folga.data), currentMonth)
    );
    
    const hoje = new Date();
    const proximos7Dias = folgas.filter(folga => {
      const folgaDate = new Date(folga.data);
      const em7Dias = addDays(hoje, 7);
      return folgaDate >= hoje && folgaDate <= em7Dias;
    });

    const crediariastasComFolgaNoMes = new Set(
      folgasThisMonth.map(f => f.crediaristaId)
    ).size;

    return {
      totalFolgasNoMes: folgasThisMonth.length,
      proximasFolgas: proximos7Dias.length,
      crediariastasComFolga: crediariastasComFolgaNoMes,
      totalCrediaristas: crediaristas.length
    };
  }, [folgas, currentMonth, crediaristas]);
  
  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      <FolgasHeader onAddFolga={() => handleDateClick(selectedDate || new Date())} />

      <FolgasStatistics
        isLoadingFolgas={isLoadingFolgas}
        isLoadingCrediaristas={isLoadingCrediaristas}
        totalFolgasNoMes={estatisticas.totalFolgasNoMes}
        proximasFolgas={estatisticas.proximasFolgas}
        crediariastasComFolga={estatisticas.crediariastasComFolga}
        totalCrediaristas={estatisticas.totalCrediaristas}
      />

      <FolgasContent
        currentMonth={currentMonth}
        crediaristas={crediaristas}
        folgas={folgas}
        isLoadingCrediaristas={isLoadingCrediaristas}
        isLoadingFolgas={isLoadingFolgas}
        handlePrevMonth={handlePrevMonth}
        handleNextMonth={handleNextMonth}
        handleDateClick={handleDateClick}
        handleDeleteFolga={handleDeleteFolga}
        getCrediaristaById={getCrediaristaById}
        getUserNameById={getUserNameById}
        selectedDate={selectedDate}
      />
      
      <AddFolgaDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedCrediarista={selectedCrediarista}
        setSelectedCrediarista={setSelectedCrediarista}
        motivo={motivo}
        setMotivo={setMotivo}
        crediaristas={crediaristas}
        onAddFolga={handleAddFolga}
        folgasNoDia={folgasDoDiaSelecionado}
        getCrediaristaNameById={getCrediaristaName}
        getUserNameForFolga={getUserNameById}
      />
      
      <ImagePreviewDialog
        viewImage={viewImage}
        setViewImage={setViewImage}
      />
    </div>
  );
}
