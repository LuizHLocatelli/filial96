
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useStickyNotes } from './useStickyNotes';
import { StickyNote } from './StickyNote';

export function StickyNotes() {
  const {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
  } = useStickyNotes();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleAddNote = () => {
    addNote({
      content: 'Nova nota...',
      color: getRandomColor(),
    });
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Notas Rápidas</h3>
        <Button size="sm" onClick={handleAddNote}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Nota
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        ))}

        {notes.length === 0 && (
          <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
            <p className="text-muted-foreground">Nenhuma nota adicionada</p>
            <Button variant="link" onClick={handleAddNote}>
              Adicionar uma nota
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function getRandomColor() {
  const colors = [
    '#FEF7CD', // amarelo claro
    '#F2FCE2', // verde claro
    '#E5DEFF', // roxo claro
    '#FFE9E7', // vermelho claro
    '#E5F6FF', // azul claro
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
