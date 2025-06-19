import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2, Eye, Copy, ChevronsUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Rotina } from '@/pages/Moveis';
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface RotinasListProps {
  searchTerm: string;
}

const RotinasList = ({ searchTerm }: RotinasListProps) => {
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    // Função para buscar os dados da API
    const fetchRotinas = async () => {
      try {
        const response = await fetch('/api/rotinas');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRotinas(data);
      } catch (error) {
        console.error("Could not fetch rotinas:", error);
        toast({
          title: "Erro ao carregar rotinas",
          description: "Houve um problema ao buscar os dados do servidor.",
          variant: "destructive",
        });
      }
    };

    fetchRotinas();
  }, [toast]);

  const handleCardToggle = (id: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredRotinas = useMemo(() => {
    return rotinas.filter(rotina => {
      const matchesSearch = !searchTerm || 
        rotina.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rotina.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rotina.setor?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = expandedCards.size === 0 || Array.from(expandedCards).includes(rotina.id);
      
      return matchesSearch && matchesStatus;
    });
  }, [rotinas, searchTerm, expandedCards]);

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
      <div className="grid gap-4 p-4">
        {filteredRotinas.map(rotina => (
          <Card key={rotina.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{rotina.titulo}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="text-sm opacity-70">{rotina.descricao}</div>
              <Badge className="mt-2">{rotina.setor}</Badge>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleCardToggle(rotina.id)}>
                Ver detalhes
                <ChevronsUpDown className="ml-2 h-4 w-4" />
              </Button>
              <Button size="sm">
                Acessar <Eye className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default RotinasList;
