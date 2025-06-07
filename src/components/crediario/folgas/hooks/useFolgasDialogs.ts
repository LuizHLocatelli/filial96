
import { useState } from "react";
import { Folga } from "../types";
import { isSameDay } from "date-fns";

export function useFolgasDialogs(folgas: Folga[]) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCrediarista, setSelectedCrediarista] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [folgasDoDiaSelecionado, setFolgasDoDiaSelecionado] = useState<Folga[]>([]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    // Filtrar folgas para o dia selecionado
    const folgasParaEsteDia = folgas.filter(f => isSameDay(new Date(f.data), date));
    setFolgasDoDiaSelecionado(folgasParaEsteDia);
    setOpenDialog(true);
    // Limpar campos para nova folga, caso o usuário queira adicionar uma nova
    setSelectedCrediarista(""); 
    setMotivo("");
  };

  return {
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
  };
}
