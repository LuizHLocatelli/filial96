/**
 * Detecta o aspect ratio da imagem baseado em suas dimensões
 * Retorna o formato mais próximo: 1:1, 3:4 ou 4:5
 */
export function detectAspectRatio(width: number, height: number): "1:1" | "3:4" | "4:5" {
  const ratio = width / height;
  
  // Definir thresholds para cada formato
  // 1:1 = 1.0
  // 3:4 = 0.75
  // 4:5 = 0.8
  
  const ratio1x1 = 1.0;
  const ratio3x4 = 3 / 4; // 0.75
  const ratio4x5 = 4 / 5; // 0.8
  
  // Calcular distância de cada formato
  const dist1x1 = Math.abs(ratio - ratio1x1);
  const dist3x4 = Math.abs(ratio - ratio3x4);
  const dist4x5 = Math.abs(ratio - ratio4x5);
  
  // Retornar o formato mais próximo
  const minDist = Math.min(dist1x1, dist3x4, dist4x5);
  
  if (minDist === dist1x1) return "1:1";
  if (minDist === dist3x4) return "3:4";
  return "4:5";
}

/**
 * Obtém as dimensões de uma imagem a partir de uma URL ou File
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      URL.revokeObjectURL(img.src); // Limpa a URL temporária
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Não foi possível carregar a imagem"));
    };
    
    // Cria uma URL temporária para o arquivo
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Combina as funções para detectar o aspect ratio de um arquivo de imagem
 */
export async function detectImageAspectRatio(file: File): Promise<"1:1" | "3:4" | "4:5"> {
  const { width, height } = await getImageDimensions(file);
  return detectAspectRatio(width, height);
}
