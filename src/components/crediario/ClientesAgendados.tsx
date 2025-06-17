
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
