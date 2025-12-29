import { useState, useEffect, useMemo } from "react";
import {
  Truck,
  Search,
  MapPin,
  Phone,
  X,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Save,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type FreteLocalidade = {
  id: string;
  localidade: string;
  valor: number;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

type SortField = "localidade" | "valor";
type SortDirection = "asc" | "desc";
type PriceFilter = "all" | "economico" | "medio" | "caro";

const ITEMS_PER_PAGE = 20;

export function Fretes() {
  const [fretes, setFretes] = useState<FreteLocalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("localidade");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFrete, setEditingFrete] = useState<FreteLocalidade | null>(null);
  const [formData, setFormData] = useState({ localidade: "", valor: "", observacoes: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch fretes from Supabase
  const fetchFretes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("moveis_frete_localidades")
      .select("*")
      .order("localidade", { ascending: true });

    if (error) {
      console.error("Erro ao carregar fretes:", error);
    } else {
      setFretes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFretes();
  }, []);

  const getPriceColor = (preco: number) => {
    if (preco <= 90) return "text-green-600";
    if (preco <= 150) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredFretes = useMemo(() => {
    let result = [...fretes];

    // Filtro por faixa de preço
    if (priceFilter === "economico") {
      result = result.filter((f) => f.valor <= 90);
    } else if (priceFilter === "medio") {
      result = result.filter((f) => f.valor > 90 && f.valor <= 150);
    } else if (priceFilter === "caro") {
      result = result.filter((f) => f.valor > 150);
    }

    // Filtro por busca (com normalização para ignorar acentos)
    if (searchTerm) {
      const normalize = (str: string) =>
        str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const term = normalize(searchTerm);
      result = result.filter((f) => normalize(f.localidade).includes(term));
    }

    // Ordenação
    result.sort((a, b) => {
      if (sortField === "localidade") {
        return sortDirection === "asc"
          ? a.localidade.localeCompare(b.localidade)
          : b.localidade.localeCompare(a.localidade);
      } else {
        return sortDirection === "asc"
          ? a.valor - b.valor
          : b.valor - a.valor;
      }
    });

    return result;
  }, [fretes, searchTerm, sortField, sortDirection, priceFilter]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredFretes.length / ITEMS_PER_PAGE);
  }, [filteredFretes]);

  const paginatedFretes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFretes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredFretes, currentPage]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleCopyValue = async (valor: number, id: string) => {
    const value = `R$ ${valor.toFixed(2).replace(".", ",")}`;
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const precoMinimo = useMemo(() => {
    if (filteredFretes.length === 0) return "0,00";
    return Math.min(...filteredFretes.map((f) => f.valor)).toFixed(2).replace(".", ",");
  }, [filteredFretes]);

  const precoMaximo = useMemo(() => {
    if (filteredFretes.length === 0) return "0,00";
    return Math.max(...filteredFretes.map((f) => f.valor)).toFixed(2).replace(".", ",");
  }, [filteredFretes]);

  const openAddModal = () => {
    setEditingFrete(null);
    setFormData({ localidade: "", valor: "", observacoes: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (frete: FreteLocalidade) => {
    setEditingFrete(frete);
    setFormData({
      localidade: fretes.find(f => f.id ===frete.id)?.localidade || "",
      valor: String(frete.valor),
      observacoes: fretes.find(f => f.id ===frete.id)?.observacoes || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFrete(null);
    setFormData({ localidade: "", valor: "", observacoes: "" });
  };

  const handleSave = async () => {
    if (!formData.localidade || !formData.valor) {
      alert("Preencha a localidade e o valor!");
      return;
    }

    setIsSaving(true);
    const valorNum = parseFloat(formData.valor.replace(",", "."));

    try {
      if (editingFrete) {
        // Update existing
        const { error } = await supabase
          .from("moveis_frete_localidades")
          .update({
            localidade: formData.localidade,
            valor: valorNum,
            observacoes: formData.observacoes || null
          })
          .eq("id", editingFrete.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("moveis_frete_localidades")
          .insert({
            localidade: formData.localidade,
            valor: valorNum,
            observacoes: formData.observacoes || null
          });

        if (error) throw error;
      }

      await fetchFretes();
      closeModal();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("moveis_frete_localidades")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchFretes();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir. Tente novamente.");
    }
  };

  return (
    <div className="w-full mx-auto animate-fade-in space-y-4 sm:space-y-6 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Fretes</h2>
          <p className="text-sm text-muted-foreground">
            Consulta de valores de frete para localidades da região
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Localidade
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {filteredFretes.length}
            </div>
            <p className="text-xs text-muted-foreground"> localidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Menor
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              R$ {precoMinimo}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Maior
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              R$ {precoMaximo}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Exibindo
            </CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {filteredFretes.length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {fretes.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros Rápidos por Faixa de Preço */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={priceFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setPriceFilter("all");
            setCurrentPage(1);
          }}
        >
          Todos
        </Button>
        <Button
          variant={priceFilter === "economico" ? "default" : "outline"}
          size="sm"
          className={priceFilter === "economico" ? "" : "text-green-600"}
          onClick={() => {
            setPriceFilter("economico");
            setCurrentPage(1);
          }}
        >
          Até R$ 90
        </Button>
        <Button
          variant={priceFilter === "medio" ? "default" : "outline"}
          size="sm"
          className={priceFilter === "medio" ? "" : "text-yellow-600"}
          onClick={() => {
            setPriceFilter("medio");
            setCurrentPage(1);
          }}
        >
          R$ 91 - 150
        </Button>
        <Button
          variant={priceFilter === "caro" ? "default" : "outline"}
          size="sm"
          className={priceFilter === "caro" ? "" : "text-red-600"}
          onClick={() => {
            setPriceFilter("caro");
            setCurrentPage(1);
          }}
        >
          Acima de R$ 150
        </Button>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar localidade..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-9 pr-9"
        />
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tabela de Fretes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Tabela de Fretes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th
                        className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("localidade")}
                      >
                        <div className="flex items-center gap-1">
                          Localidade
                          {sortField === "localidade" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th
                        className="text-right py-3 px-4 font-medium cursor-pointer hover:bg-muted/50 select-none"
                        onClick={() => handleSort("valor")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Valor
                          {sortField === "valor" &&
                            (sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFretes.length > 0 ? (
                      paginatedFretes.map((frete) => (
                        <tr
                          key={frete.id}
                          className="border-b last:border-0 hover:bg-muted/50"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{frete.localidade}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleCopyValue(frete.valor, frete.id)}
                              className={`inline-flex items-center gap-1 font-medium ${getPriceColor(
                                frete.valor
                              )} hover:opacity-75 transition-opacity`}
                            >
                              R$ {frete.valor.toFixed(2).replace(".", ",")}
                              {copiedId === frete.id ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openEditModal(frete)}
                                className="p-1 hover:bg-muted rounded"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                              </button>
                              {deleteConfirmId === frete.id ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleDelete(frete.id)}
                                    className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(frete.id)}
                                  className="p-1 hover:bg-muted rounded"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-muted-foreground">
                          Nenhuma localidade encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">Observações:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Escadas: + R$ 10,00 por andar</li>
              <li>Nota Fiscal: + 20% sobre o valor do frete</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Contato para entregas:</p>
              <a
                href="tel:51980566362"
                className="text-sm text-primary hover:underline font-medium"
              >
                Flavio Pinali: (51) 98056-6362
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Adicionar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {editingFrete ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Editar Localidade
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Nova Localidade
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Localidade *</label>
                <Input
                  value={formData.localidade}
                  onChange={(e) => setFormData({ ...formData, localidade: e.target.value })}
                  placeholder="Ex: Torres Centro"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valor (R$) *</label>
                <Input
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="Ex: 60,00"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Observações</label>
                <Input
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Ex: Frete adicional para locais com escada"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
