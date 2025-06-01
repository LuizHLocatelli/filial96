import { useState } from "react";
import { ClienteFormDialog } from "./components/ClienteFormDialog";
import { ClienteCalendar } from "./components/ClienteCalendar";
import { ClienteFormValues } from "./types";
import { useClientes } from "./hooks/useClientes";
import { ClienteHeader } from "./clientes/ClienteHeader";
import { ClientesLoader } from "./clientes/ClientesLoader";
import { ClientesDashboard } from "./clientes/dashboard/ClientesDashboard";
import { ClientesDataTable } from "./clientes/table/ClientesDataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Table,
  Users
} from "lucide-react";

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

  const [activeTab, setActiveTab] = useState("dashboard");

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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-12 bg-muted/30 p-1 rounded-xl">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Painel</span>
              </TabsTrigger>
              <TabsTrigger 
                value="table" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Table className="h-4 w-4" />
                <span className="hidden sm:inline">Tabela</span>
                <span className="sm:hidden">Lista</span>
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Calendário</span>
                <span className="sm:hidden">Cal.</span>
              </TabsTrigger>
              <TabsTrigger 
                value="legacy" 
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Lista Simples</span>
                <span className="sm:hidden">Simples</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <ClientesDashboard clientes={clientes} />
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <ClientesDataTable 
                clientes={clientes}
                onEdit={openEditDialog}
                onDelete={deleteCliente}
              />
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <ClienteCalendar
                currentMonth={currentMonth}
                daysInMonth={daysInMonth}
                clientes={clientes}
                prevMonth={prevMonth}
                nextMonth={nextMonth}
              />
            </TabsContent>

            <TabsContent value="legacy" className="mt-6">
              {/* Keep existing code (original list component) */}
            </TabsContent>
          </Tabs>
        </>
      </ClientesLoader>
    </div>
  );
}
