import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MobileSearchDebugProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchDebug({ isOpen, onClose }: MobileSearchDebugProps) {
  const { searchTerm, searchResults, isSearching, performSearch, clearSearch } = useGlobalSearch();
  const [testInput, setTestInput] = useState('');

  if (!isOpen) return null;

  const runTestSearch = () => {
    console.log('🧪 [DEBUG TEST] Executando teste de pesquisa:', testInput);
    performSearch(testInput);
  };

  const clearTestSearch = () => {
    setTestInput('');
    clearSearch();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Debug Pesquisa Mobile
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status atual */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Status Atual:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {searchTerm ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                <span>Termo de busca: "{searchTerm || 'vazio'}"</span>
              </div>
              <div className="flex items-center gap-2">
                {isSearching ? <AlertCircle className="h-4 w-4 text-blue-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                <span>Status: {isSearching ? 'Pesquisando...' : 'Pronto'}</span>
              </div>
              <div className="flex items-center gap-2">
                {searchResults.length > 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-yellow-500" />}
                <span>Resultados: {searchResults.length}</span>
              </div>
            </div>
          </div>

          {/* Campo de teste */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Teste de Pesquisa:</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Digite um termo para testar..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={runTestSearch} size="sm">
                Testar
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setTestInput('hub')} variant="outline" size="sm">
                Testar "hub"
              </Button>
              <Button onClick={() => setTestInput('moda')} variant="outline" size="sm">
                Testar "moda"
              </Button>
              <Button onClick={clearTestSearch} variant="outline" size="sm">
                Limpar
              </Button>
            </div>
          </div>

          {/* Resultados */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Resultados Encontrados:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div key={result.id} className="p-2 bg-muted rounded text-sm">
                    <div className="font-medium">{result.title}</div>
                    <div className="text-muted-foreground text-xs">{result.description}</div>
                    <div className="text-primary text-xs">Caminho: {result.path}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testes rápidos */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Testes Rápidos:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => { setTestInput('móveis'); runTestSearch(); }} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Testar Móveis
              </Button>
              <Button 
                onClick={() => { setTestInput('crediário'); runTestSearch(); }} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Testar Crediário
              </Button>
              <Button 
                onClick={() => { setTestInput('rotinas'); runTestSearch(); }} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Testar Rotinas
              </Button>
              <Button 
                onClick={() => { setTestInput('orientações'); runTestSearch(); }} 
                variant="outline" 
                size="sm"
                className="text-xs"
              >
                Testar Orientações
              </Button>
            </div>
          </div>

          {/* Informações técnicas */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Info Técnica:</h3>
            <div className="text-xs space-y-1 bg-muted p-2 rounded">
              <div>User Agent: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
              <div>Largura da tela: {window.innerWidth}px</div>
              <div>Altura da tela: {window.innerHeight}px</div>
              <div>Touch Support: {('ontouchstart' in window) ? 'Sim' : 'Não'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 