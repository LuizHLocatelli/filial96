/**
 * Formatar número de telefone brasileiro no padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Se não há números, retorna string vazia
  if (!numbers) return '';
  
  // Limita a 11 dígitos (DDD + 9 dígitos)
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a formatação baseada no número de dígitos
  if (limitedNumbers.length <= 2) {
    // Apenas DDD: (XX
    return `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 6) {
    // DDD + parte do número: (XX) XXXX
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    // Celular: (XX) XXXXX-XXXX
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
}

/**
 * Remove a formatação do telefone, deixando apenas os números
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Valida se um número de telefone brasileiro está correto
 */
export function isValidPhoneNumber(value: string): boolean {
  const numbers = unformatPhoneNumber(value);
  
  // Telefone deve ter 10 dígitos (fixo) ou 11 dígitos (celular)
  if (numbers.length !== 10 && numbers.length !== 11) {
    return false;
  }
  
  // DDD deve estar entre 11 e 99
  const ddd = parseInt(numbers.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  // Para celular (11 dígitos), o terceiro dígito deve ser 9
  if (numbers.length === 11 && numbers[2] !== '9') {
    return false;
  }
  
  return true;
}
