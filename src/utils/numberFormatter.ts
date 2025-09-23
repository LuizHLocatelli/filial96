// Utilitários para formatação de números brasileiros

/**
 * Converte número do formato brasileiro (1.234,56) para formato americano (1234.56)
 */
export function parseBrazilianNumber(value: string): number {
  if (!value || value.trim() === '') return 0;

  // Remove espaços e outros caracteres
  let cleanValue = value.trim();

  // Se já está no formato americano, retorna
  if (/^\d+\.?\d*$/.test(cleanValue)) {
    return parseFloat(cleanValue);
  }

  // Remove pontos (separadores de milhares) e substitui vírgula por ponto
  cleanValue = cleanValue
    .replace(/\./g, '') // Remove pontos (milhares)
    .replace(',', '.'); // Substitui vírgula por ponto (decimal)

  const result = parseFloat(cleanValue);
  return isNaN(result) ? 0 : result;
}

/**
 * Converte número para formato brasileiro (1.234,56)
 */
export function formatBrazilianNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || value === null || value === undefined) return '';

  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Converte valor monetário para formato brasileiro
 */
export function formatBrazilianCurrency(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '';

  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata valor para input (remove formatação mas mantém vírgula decimal)
 */
export function formatForInput(value: number): string {
  if (isNaN(value) || value === null || value === undefined) return '';

  return value.toFixed(2).replace('.', ',');
}

/**
 * Valida se um valor string pode ser convertido para número
 */
export function isValidBrazilianNumber(value: string): boolean {
  if (!value || value.trim() === '') return true; // Vazio é válido

  // Aceita formatos: 123, 123,45, 1.234, 1.234,56
  const brazilianNumberRegex = /^(\d{1,3}(\.\d{3})*)(,\d{1,2})?$|^\d+(,\d{1,2})?$/;
  return brazilianNumberRegex.test(value.trim());
}

/**
 * Limpa valor de input removendo caracteres inválidos
 */
export function cleanBrazilianNumberInput(value: string): string {
  // Remove tudo exceto dígitos, pontos e vírgulas
  return value.replace(/[^\d.,]/g, '');
}