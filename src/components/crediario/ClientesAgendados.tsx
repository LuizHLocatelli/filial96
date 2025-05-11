
import { ClienteFormDialog } from "./components/ClienteFormDialog";
import { ClienteCalendar } from "./components/ClienteCalendar";
import { ClienteFormValues } from "./types";
import { useClientes } from "./hooks/useClientes";
import { ClienteHeader } from "./clientes/ClienteHeader";
import { ClienteList } from "./clientes/ClienteList";
import { ClientesLoader } from "./clientes/ClientesLoader";

export function ClientesAgendados() {
  const { 
    clientes,
    clientesNoMes,
    currentMonth,
    editingCliente,
    dialogOpen,
    daysInMonth,
    isLoading,
    setDialogOpen,
    addCliente,
    updateCliente,
    deleteCliente,
    prevMonth,
    nextMonth,
    openAddDialog,
    openEditDialog
  } = useClientes();

  const handleSubmit = async (data: ClienteFormValues) => {
    if (editingCliente) {
      await updateCliente(editingCliente.id, data);
    } else {
      await addCliente(data);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <ClientesLoader isLoading={isLoading}>
        <>
          <ClienteHeader 
            clientes={clientes}
            clientesNoMes={clientesNoMes}
            onAddNew={openAddDialog}
          />
            
          <ClienteFormDialog
            open={dialogOpen}
            cliente={editingCliente}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmit}
          />

          <div className="grid grid-cols-1 gap-6">
            <ClienteCalendar
              currentMonth={currentMonth}
              daysInMonth={daysInMonth}
              clientes={clientes}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
            />
            
            <ClienteList 
              clientes={clientes}
              onEdit={openEditDialog}
              onDelete={deleteCliente}
              onAddNew={openAddDialog}
            />
          </div>
        </>
      </ClientesLoader>
    </div>
  );
}
