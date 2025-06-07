
import { useFolgasData } from "./hooks/useFolgasData";
import { useCrediaristasData } from "./hooks/useCrediaristasData";
import { useUsersData } from "./hooks/useUsersData";
import { useFolgasCalendar } from "./hooks/useFolgasCalendar";
import { useFolgasDialogs } from "./hooks/useFolgasDialogs";
import { useFolgasOperations } from "./hooks/useFolgasOperations";

export function useFolgas() {
  // Data hooks
  const { folgas, setFolgas, isLoadingFolgas, getFolgasForDay } = useFolgasData();
  const { crediaristas, isLoadingCrediaristas, getCrediaristaById } = useCrediaristasData();
  const { allUsers, isLoadingUsers, getUserNameById } = useUsersData();
  
  // Calendar hook
  const { currentMonth, handlePrevMonth, handleNextMonth, weeks } = useFolgasCalendar();
  
  // Dialogs hook
  const {
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
    folgasDoDiaSelecionado,
    setFolgasDoDiaSelecionado,
    handleDateClick,
  } = useFolgasDialogs(folgas);

  // Operations hook
  const { handleAddFolga, handleDeleteFolga } = useFolgasOperations(
    folgas,
    setFolgas,
    selectedDate,
    selectedCrediarista,
    motivo,
    setOpenDialog,
    setSelectedDate,
    setSelectedCrediarista,
    setMotivo,
    setFolgasDoDiaSelecionado
  );

  return {
    currentMonth,
    crediaristas,
    isLoadingCrediaristas,
    isLoadingFolgas,
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
    getUserNameById,
    weeks,
    allUsers,
    isLoadingUsers,
    folgasDoDiaSelecionado,
    handleDateClick,
  };
}
