
import { useState } from 'react';
import { PDFViewer } from './pdf-viewer';
import { Button } from './button';
import { Input } from './input';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export function PDFViewerDemo() {
  const [pdfUrl, setPdfUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  const handleLoadPDF = () => {
    if (pdfUrl.trim()) {
      setCurrentUrl(pdfUrl.trim());
    }
  };

  const loadSamplePDF = () => {
    // Exemplo com um PDF público
    const sampleUrl = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
    setPdfUrl(sampleUrl);
    setCurrentUrl(sampleUrl);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF Viewer Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Cole a URL do PDF aqui..."
              className="flex-1"
            />
            <Button onClick={handleLoadPDF} disabled={!pdfUrl.trim()}>
              Carregar
            </Button>
          </div>
          
          <Button variant="outline" onClick={loadSamplePDF} className="w-full">
            Carregar PDF de Exemplo
          </Button>
        </CardContent>
      </Card>

      {currentUrl && (
        <Card>
          <CardContent className="p-6">
            <PDFViewer url={currentUrl} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
