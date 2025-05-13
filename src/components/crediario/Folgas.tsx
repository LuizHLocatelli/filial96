
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
    weeks
  } = useFolgas();
  
  // Função para lidar com cliques nas datas do calendário
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setOpenDialog(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <FolgasSummary
          crediaristas={crediaristas}
          folgas={folgas}
          currentMonth={currentMonth}
          isLoading={isLoadingCrediaristas}
        />
        
        <Button onClick={() => setOpenDialog(true)}>
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
      
      <FolgasList
        folgas={folgas}
        getCrediaristaById={getCrediaristaById}
        onDeleteFolga={handleDeleteFolga}
        onAddFolga={() => setOpenDialog(true)}
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
      />
      
      <ImagePreviewDialog
        imageUrl={viewImage}
        onClose={() => setViewImage(null)}
      />
    </div>
  );
}
