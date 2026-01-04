import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, Search, Settings, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useProcedimentosSSC } from '@/hooks/useProcedimentosSSC'
import { ProcedimentoForm } from './ProcedimentoForm'
import { ProcedimentoSSC } from '@/types/ssc-procedimentos'

export function AdminProcedimentosButton() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'gerente'

  const [isOpen, setIsOpen] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProcedimento, setEditingProcedimento] = useState<ProcedimentoSSC | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const {
    procedimentos,
    loading,
    fetchProcedimentos,
    createProcedimento,
    updateProcedimento,
    deleteProcedimento,
  } = useProcedimentosSSC()

  useEffect(() => {
    if (isOpen && isManager) {
      fetchProcedimentos()
    }
  }, [isOpen, isManager])

  const filteredProcedimentos = procedimentos.filter(p =>
    p.fabricante.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAdd = () => {
    setEditingProcedimento(null)
    setIsFormOpen(true)
  }

  const handleEdit = (procedimento: ProcedimentoSSC) => {
    setEditingProcedimento(procedimento)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      try {
        await deleteProcedimento(id)
        toast.success('Procedimento excluído com sucesso')
      } catch (error) {
        toast.error('Erro ao excluir procedimento')
      }
    }
  }

  const handleFormSubmit = async (dados: Partial<ProcedimentoSSC>) => {
    try {
      if (editingProcedimento) {
        await updateProcedimento(editingProcedimento.id, dados)
        toast.success('Procedimento atualizado com sucesso')
      } else {
        await createProcedimento(dados as any)
        toast.success('Procedimento criado com sucesso')
      }
      setIsFormOpen(false)
      setEditingProcedimento(null)
      fetchProcedimentos()
    } catch (error) {
      toast.error('Erro ao salvar procedimento')
    }
  }

  if (!isManager) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Gerenciar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Procedimentos SSC
          </DialogTitle>
        </DialogHeader>

        {/* Formulário de Add/Edit */}
        {isFormOpen ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsFormOpen(false)
                setEditingProcedimento(null)
              }}
            >
              ← Voltar à lista
            </Button>
            <ProcedimentoForm
              procedimento={editingProcedimento}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setEditingProcedimento(null)
              }}
            />
          </div>
        ) : (
          <>
            {/* Barra de ações */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between pb-4 border-b">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar procedimentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleAdd} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Novo Procedimento
              </Button>
            </div>

            {/* Lista de procedimentos */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando...
              </div>
            ) : filteredProcedimentos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <AlertCircle className="h-8 w-8" />
                <p>Nenhum procedimento encontrado</p>
                <Button variant="outline" size="sm" onClick={handleAdd}>
                  Adicionar primeiro procedimento
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProcedimentos.map((proc) => (
                  <div
                    key={proc.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{proc.fabricante}</span>
                        <Badge variant="secondary" className="text-xs">
                          {proc.categoria}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {proc.procedimento}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(proc)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(proc.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
