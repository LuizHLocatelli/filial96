
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClienteFormValues } from "./types";
import { useClientes } from "./hooks/useClientes";
import { ClienteStats } from "./components/ClienteStats";
import { ClienteCalendar } from "./components/ClienteCalendar";
import { ClientesTable } from "./components/ClientesTable";
import { ClienteFormDialog } from "./components/ClienteFormDialog";

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
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <ClienteStats clientes={clientes} clientesNoMes={clientesNoMes} />
            
            <Button className="md:w-auto w-full" onClick={openAddDialog}>
              Adicionar Cliente
            </Button>
            
            <ClienteFormDialog
              open={dialogOpen}
              cliente={editingCliente}
              onOpenChange={setDialogOpen}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <ClienteCalendar
              currentMonth={currentMonth}
              daysInMonth={daysInMonth}
              clientes={clientes}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Lista de Clientes Agendados</CardTitle>
                <CardDescription>
                  Todos os clientes com agendamentos de pagamento ou renegociação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClientesTable 
                  clientes={clientes}
                  onEdit={openEditDialog}
                  onDelete={deleteCliente}
                  onAddNew={openAddDialog}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
