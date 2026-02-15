import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Trash2, Edit2 } from 'lucide-react'
import { ProcedimentoSSC, ProcedimentoCanal, ProcedimentoLink, ProcedimentoContato } from '@/types/ssc-procedimentos'

interface ProcedimentoFormProps {
  procedimento?: ProcedimentoSSC | null
  onSubmit: (dados: Partial<ProcedimentoSSC>) => Promise<void>
  onCancel: () => void
}

const CATEGORIAS = [
  'Linha Branca',
  'Eletroportateis',
  'Audio e Video',
  'Informatica',
  'Telefonia',
  'Coccao',
  'Automotivo',
  'Ferramentas',
  'Bicicletes',
  'Outros',
]

const TIPOS_CANAL = ['SAC', 'WhatsApp', 'E-mail', 'Loja', 'Site', 'Chat', 'Outro']
const TIPOS_CONTATO = ['Telefone', 'E-mail', 'Ramal', 'Responsavel', 'Outro']

export function ProcedimentoForm({ procedimento, onSubmit, onCancel }: ProcedimentoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fabricante: '',
    categoria: '',
    procedimento: '',
    canais: [] as ProcedimentoCanal[],
    observacoes: [] as string[],
    links_principais: [] as ProcedimentoLink[],
    contatos_exclusivos: [] as ProcedimentoContato[],
  })

  // Novos itens a serem adicionados
  const [novoCanal, setNovoCanal] = useState<ProcedimentoCanal>({ tipo: 'SAC', valor: '', horario: '' })
  const [novaObservacao, setNovaObservacao] = useState('')
  const [novoLink, setNovoLink] = useState<ProcedimentoLink>({ titulo: '', url: '' })
  const [novoContato, setNovoContato] = useState<ProcedimentoContato>({ nome: '', tipo: 'Responsavel', valor: '' })

  useEffect(() => {
    if (procedimento) {
      setFormData({
        fabricante: procedimento.fabricante,
        categoria: procedimento.categoria,
        procedimento: procedimento.procedimento,
        canais: procedimento.canais || [],
        observacoes: procedimento.observacoes || [],
        links_principais: procedimento.links_principais || [],
        contatos_exclusivos: procedimento.contatos_exclusivos || [],
      })
    }
  }, [procedimento])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fabricante.trim() || !formData.categoria || !formData.procedimento.trim()) {
      alert('Preencha os campos obrigatórios: Fabricante, Categoria e Procedimento')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Operações de arrays
  const adicionarCanal = () => {
    if (novoCanal.valor.trim()) {
      setFormData(prev => ({ ...prev, canais: [...prev.canais, novoCanal ]}))
      setNovoCanal({ tipo: 'SAC', valor: '', horario: '' })
    }
  }

  const removerCanal = (index: number) => {
    setFormData(prev => ({ ...prev, canais: prev.canais.filter((_, i) => i !== index) }))
  }

  const adicionarObservacao = () => {
    if (novaObservacao.trim()) {
      setFormData(prev => ({ ...prev, observacoes: [...prev.observacoes, novaObservacao.trim()] }))
      setNovaObservacao('')
    }
  }

  const removerObservacao = (index: number) => {
    setFormData(prev => ({ ...prev, observacoes: prev.observacoes.filter((_, i) => i !== index) }))
  }

  const adicionarLink = () => {
    if (novoLink.titulo.trim() && novoLink.url.trim()) {
      setFormData(prev => ({ ...prev, links_principais: [...prev.links_principais, novoLink] }))
      setNovoLink({ titulo: '', url: '' })
    }
  }

  const removerLink = (index: number) => {
    setFormData(prev => ({ ...prev, links_principais: prev.links_principais.filter((_, i) => i !== index) }))
  }

  const adicionarContato = () => {
    if (novoContato.nome.trim() && novoContato.valor.trim()) {
      setFormData(prev => ({ ...prev, contatos_exclusivos: [...prev.contatos_exclusivos, novoContato] }))
      setNovoContato({ nome: '', tipo: 'Responsavel', valor: '' })
    }
  }

  const removerContato = (index: number) => {
    setFormData(prev => ({ ...prev, contatos_exclusivos: prev.contatos_exclusivos.filter((_, i) => i !== index) }))
  }

  return (
    <Card className="w-full max-w-3xl mx-auto max-h-[85vh] overflow-y-auto">
      <CardHeader className="pb-4 sticky top-0 bg-background z-10 border-b">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Edit2 className="h-5 w-5" />
          {procedimento ? 'Editar Procedimento' : 'Novo Procedimento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos Básicos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fabricante" className="text-sm">Fabricante *</Label>
              <Input
                id="fabricante"
                value={formData.fabricante}
                onChange={(e) => setFormData(prev => ({ ...prev, fabricante: e.target.value }))}
                required
                className="mt-1"
                placeholder="Ex: Brastemp, Consul..."
              />
            </div>
            <div>
              <Label htmlFor="categoria" className="text-sm">Categoria *</Label>
              <select
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                required
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Selecione...</option>
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="procedimento" className="text-sm">Procedimento *</Label>
            <Textarea
              id="procedimento"
              value={formData.procedimento}
              onChange={(e) => setFormData(prev => ({ ...prev, procedimento: e.target.value }))}
              required
              rows={4}
              className="mt-1 resize-none"
              placeholder="Descreva o procedimento de atendimento..."
            />
          </div>

          {/* Canais de Atendimento */}
          <div className="border rounded-lg p-4 space-y-3">
            <Label className="text-sm font-medium">Canais de Atendimento</Label>
            {formData.canais.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.canais.map((canal, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                    <span>{canal.tipo}: {canal.valor}</span>
                    {canal.horario && <span className="text-muted-foreground">({canal.horario})</span>}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-muted"
                      onClick={() => removerCanal(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <select
                value={novoCanal.tipo}
                onChange={(e) => setNovoCanal(prev => ({ ...prev, tipo: e.target.value }))}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                {TIPOS_CANAL.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <Input
                value={novoCanal.valor}
                onChange={(e) => setNovoCanal(prev => ({ ...prev, valor: e.target.value }))}
                placeholder="Telefone, email ou URL"
                className="sm:col-span-2"
              />
              <div className="flex gap-1">
                <Input
                  value={novoCanal.horario || ''}
                  onChange={(e) => setNovoCanal(prev => ({ ...prev, horario: e.target.value }))}
                  placeholder="Horário"
                  className="flex-1"
                />
                <Button type="button" onClick={adicionarCanal} size="sm" className="px-2">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="border rounded-lg p-4 space-y-3">
            <Label className="text-sm font-medium">Observações</Label>
            {formData.observacoes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.observacoes.map((obs, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1 pr-1 max-w-md">
                    <span className="truncate">{obs}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1 hover:bg-muted"
                      onClick={() => removerObservacao(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Adicionar observação..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarObservacao())}
                className="flex-1"
              />
              <Button type="button" onClick={adicionarObservacao} size="sm" className="px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="border rounded-lg p-4 space-y-3">
            <Label className="text-sm font-medium">Links Úteis</Label>
            {formData.links_principais.length > 0 && (
              <div className="space-y-2">
                {formData.links_principais.map((link, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded">
                    <span className="text-sm">{link.titulo}</span>
                    <div className="flex items-center gap-2">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate max-w-40">
                        {link.url}
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-muted"
                        onClick={() => removerLink(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                value={novoLink.titulo}
                onChange={(e) => setNovoLink(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título do link"
              />
              <Input
                value={novoLink.url}
                onChange={(e) => setNovoLink(prev => ({ ...prev, url: e.target.value }))}
                placeholder="URL"
                className="sm:col-span-1"
              />
              <Button type="button" onClick={adicionarLink} size="sm" className="sm:col-span-1">
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          </div>

          {/* Contatos Exclusivos (uso interno) */}
          <div className="border rounded-lg p-4 space-y-3 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <Label className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Contatos Exclusivos (Uso Interno)
            </Label>
            {formData.contatos_exclusivos.length > 0 && (
              <div className="space-y-2">
                {formData.contatos_exclusivos.map((contato, index) => (
                  <div key={index} className="flex items-center justify-between bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{contato.nome}</span>
                      <Badge variant="outline" className="text-xs">{contato.tipo}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{contato.valor}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-amber-200 dark:hover:bg-amber-800"
                        onClick={() => removerContato(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input
                value={novoContato.nome}
                onChange={(e) => setNovoContato(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome"
                className="bg-background"
              />
              <select
                value={novoContato.tipo}
                onChange={(e) => setNovoContato(prev => ({ ...prev, tipo: e.target.value }))}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                {TIPOS_CONTATO.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              <Input
                value={novoContato.valor}
                onChange={(e) => setNovoContato(prev => ({ ...prev, valor: e.target.value }))}
                placeholder="Valor"
                className="bg-background"
              />
              <Button type="button" onClick={adicionarContato} size="sm" className="sm:col-span-1">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t sticky bottom-0 bg-background pb-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : procedimento ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
