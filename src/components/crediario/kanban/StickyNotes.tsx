
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, FolderPlus } from 'lucide-react';
import { useStickyNotes } from './useStickyNotes';
import { StickyNoteItem } from './StickyNoteItem';
import { useNoteFolders } from './useNoteFolders';
import { AddFolderDialog } from './AddFolderDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateFolderData } from './types';

export function StickyNotes() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [addFolderDialogOpen, setAddFolderDialogOpen] = useState(false);
  
  const {
    notes,
    isLoading: notesLoading,
    addNote,
    updateNote,
    deleteNote,
  } = useStickyNotes(selectedFolder);
  
  const {
    folders,
    isLoading: foldersLoading,
    addFolder,
    deleteFolder,
  } = useNoteFolders();

  const handleAddNote = () => {
    addNote({
      content: 'Nova nota...',
      color: getRandomColor(),
      folderId: selectedFolder,
    });
  };

  const handleMoveToFolder = (noteId: string, folderId: string | null) => {
    updateNote(noteId, notes.find(note => note.id === noteId)?.content || '', folderId);
  };
  
  const handleAddFolder = async (folderData: CreateFolderData) => {
    await addFolder(folderData);
  };

  const isLoading = notesLoading || foldersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Notas Rápidas</h3>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={() => setAddFolderDialogOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-1" />
            Nova Pasta
          </Button>
          <Button size="sm" onClick={handleAddNote}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Nota
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="todas" 
        value={selectedFolder === null ? "todas" : selectedFolder}
        onValueChange={(value) => setSelectedFolder(value === "todas" ? null : value)}
        className="w-full"
      >
        <TabsList className="mb-4 w-full overflow-x-auto flex flex-nowrap">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="sem-pasta">Sem pasta</TabsTrigger>
          {folders.map(folder => (
            <TabsTrigger key={folder.id} value={folder.id}>
              {folder.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="todas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <StickyNoteItem
                  key={note.id}
                  note={note}
                  folders={folders}
                  onUpdate={updateNote}
                  onMoveToFolder={handleMoveToFolder}
                  onDelete={deleteNote}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Nenhuma nota adicionada</p>
                <Button variant="link" onClick={handleAddNote}>
                  Adicionar uma nota
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sem-pasta">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.length > 0 ? (
              notes.map((note) => (
                <StickyNoteItem
                  key={note.id}
                  note={note}
                  folders={folders}
                  onUpdate={updateNote}
                  onMoveToFolder={handleMoveToFolder}
                  onDelete={deleteNote}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Nenhuma nota sem pasta</p>
                <Button variant="link" onClick={handleAddNote}>
                  Adicionar uma nota
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {folders.map(folder => (
          <TabsContent key={folder.id} value={folder.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <StickyNoteItem
                    key={note.id}
                    note={note}
                    folders={folders}
                    onUpdate={updateNote}
                    onMoveToFolder={handleMoveToFolder}
                    onDelete={deleteNote}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">Nenhuma nota nesta pasta</p>
                  <Button variant="link" onClick={handleAddNote}>
                    Adicionar uma nota
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog para adicionar nova pasta */}
      <AddFolderDialog 
        isOpen={addFolderDialogOpen}
        onClose={() => setAddFolderDialogOpen(false)}
        onAddFolder={handleAddFolder}
      />
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
