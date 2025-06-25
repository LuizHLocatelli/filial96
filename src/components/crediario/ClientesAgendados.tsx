import { useState } from "react";
import { ClienteFormDialog } from "./components/ClienteFormDialog";
import { ClienteFormValues } from "./types";
import { useClientes } from "./hooks/useClientes";
import { ClienteHeader } from "./clientes/ClienteHeader";
import { ClientesLoader } from "./clientes/ClientesLoader";
import { ClientesDataTable } from "./clientes/table/ClientesDataTable";

export function ClientesAgendados() {
  const { 
    clientes,
    clientesNoMes,
    editingCliente,
    dialogOpen,
    isLoading,
    setDialogOpen,
    addCliente,
    updateCliente,
    deleteCliente,
    openAddDialog,
    openEditDialog
  } = useClientes();

  const handleSubmit = async (data: ClienteFormValues): Promise<void> => {
    if (editingCliente) {
      await updateCliente(editingCliente.id, data);
    } else {
      await addCliente(data);
    }
    setDialogOpen(false);
    return Promise.resolve();
  };

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
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

          <ClientesDataTable 
            clientes={clientes}
            onEdit={openEditDialog}
            onDelete={deleteCliente}
          />
        </>
      </ClientesLoader>
    </div>
  );
}
