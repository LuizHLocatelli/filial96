import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, FolderPlus } from 'lucide-react';
import { useStickyNotes } from './useStickyNotes';
import { StickyNoteItem } from './StickyNoteItem';
import { useNoteFolders } from './useNoteFolders';
import { AddFolderDialog } from './AddFolderDialog';
import { CreateNoteDialog } from './CreateNoteDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateFolderData } from './types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function StickyNotes() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>("todas");
  const [addFolderDialogOpen, setAddFolderDialogOpen] = useState(false);
  const [createNoteDialogOpen, setCreateNoteDialogOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<{ id: string, name: string } | null>(null);
  
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
    updateFolder,
    deleteFolder,
  } = useNoteFolders();

  const handleAddNote = () => {
    setCreateNoteDialogOpen(true);
  };

  const handleCreateNote = async (content: string, color: string, folderId: string | null) => {
    await addNote({
      content,
      color,
      folderId,
    });
    // Real-time updates are now handled by the Supabase subscription
    setCreateNoteDialogOpen(false);
  };

  const handleMoveToFolder = (noteId: string, folderId: string | null) => {
    updateNote(noteId, notes.find(note => note.id === noteId)?.content || '', folderId);
  };
  
  const handleAddFolder = async (folderData: CreateFolderData) => {
    if (folderToEdit) {
      await updateFolder(folderToEdit.id, folderData.name);
      setFolderToEdit(null);
    } else {
      await addFolder(folderData);
    }
    setAddFolderDialogOpen(false);
  };
  
  const handleEditFolder = (folder: { id: string, name: string }) => {
    setFolderToEdit(folder);
    setAddFolderDialogOpen(true);
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
          <Button size="sm" variant="outline" onClick={() => {
            setFolderToEdit(null);
            setAddFolderDialogOpen(true);
          }}>
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
            <div key={folder.id} className="relative group">
              <TabsTrigger value={folder.id}>
                {folder.name}
              </TabsTrigger>
              <div className="absolute right-0 top-0 hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditFolder({ id: folder.id, name: folder.name });
                  }}
                >
                  <span className="sr-only">Editar</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Excluir</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir pasta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir a pasta "{folder.name}"? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteFolder(folder.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
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

      {/* Dialog para adicionar ou editar pasta */}
      <AddFolderDialog 
        isOpen={addFolderDialogOpen}
        onClose={() => {
          setFolderToEdit(null);
          setAddFolderDialogOpen(false);
        }}
        onAddFolder={handleAddFolder}
        initialData={folderToEdit || undefined}
      />

      {/* Dialog para criar nova nota */}
      <CreateNoteDialog
        isOpen={createNoteDialogOpen}
        onClose={() => setCreateNoteDialogOpen(false)}
        onCreateNote={handleCreateNote}
        folders={folders}
      />
    </Card>
  );
}
