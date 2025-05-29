import { Button } from "@/components/ui/button";
import { FolgasSummary } from "./folgas/FolgasSummary";
import { FolgasCalendar } from "./folgas/FolgasCalendar";
import { FolgasList } from "./folgas/FolgasList";
import { AddFolgaDialog } from "./folgas/AddFolgaDialog";
import { ImagePreviewDialog } from "./folgas/ImagePreviewDialog";
import { useFolgas } from "./folgas/useFolgas";

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
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-4">
          <Button onClick={() => handleDateClick(selectedDate || new Date())}>
            Adicionar Folga
          </Button>
        </div>
      
        <FolgasCalendar
          currentMonth={currentMonth}
          crediaristas={crediaristas}
          folgas={folgas}
          isLoadingCrediaristas={isLoadingCrediaristas}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateClick={handleDateClick}
        />
      </div>
      
      <FolgasList
        folgas={folgas}
        getCrediaristaById={getCrediaristaById}
        onDeleteFolga={handleDeleteFolga}
        onAddFolga={() => handleDateClick(selectedDate || new Date())}
        getUserNameById={getUserNameById}
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
        imageUrl={viewImage}
        onClose={() => setViewImage(null)}
      />

      <FolgasSummary
        crediaristas={crediaristas}
        folgas={folgas}
        currentMonth={currentMonth}
        isLoading={isLoadingCrediaristas}
      />
    </div>
  );
}
