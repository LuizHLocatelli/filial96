/**
 * 🛡️ Validador do Sistema de Design - Filial 96
 * Garante que os padrões estabelecidos sejam mantidos
 */

export interface DesignSystemValidation {
  isValid: boolean;
  score: number;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface PageValidation {
  pageName: string;
  hasPageLayout: boolean;
  hasPageHeader: boolean;
  hasConsistentColors: boolean;
  isMobileOptimized: boolean;
  fileSize: 'small' | 'medium' | 'large';
  score: number;
}

/**
 * Padrões obrigatórios do Design System
 */
export const DESIGN_PATTERNS = {
  // Cores proibidas
  FORBIDDEN_COLORS: [
    'bg-blue-', 'text-blue-', 'border-blue-',
    'from-blue-', 'to-blue-', 'via-blue-'
  ],
  
  // Cores permitidas
  ALLOWED_COLORS: [
    'text-primary', 'bg-primary', 'border-primary',
    'text-green-', 'bg-green-', 'border-green-',
    'from-green-', 'to-green-', 'via-green-'
  ],
  
  // Componentes obrigatórios
  REQUIRED_COMPONENTS: [
    'PageLayout',
    'PageHeader'
  ],
  
  // Classes de grid responsivo
  RESPONSIVE_GRIDS: [
    'grid-responsive-cards',
    'grid-responsive-stats', 
    'grid-responsive-files',
    'grid-cols-1 sm:grid-cols-2',
    'grid-cols-2 sm:grid-cols-4'
  ],
  
  // Touch targets mínimos
  MIN_TOUCH_TARGET: 44, // pixels
  
  // Tamanho máximo de arquivo
  MAX_FILE_LINES: 200
};

/**
 * Valida se uma página segue os padrões do Design System
 */
export function validatePageStructure(
  pageContent: string,
  pageName: string
): PageValidation {
  const errors: string[] = [];
  let score = 100;
  
  // 1. Verificar PageLayout (obrigatório)
  const hasPageLayout = pageContent.includes('PageLayout');
  if (!hasPageLayout) {
    errors.push('❌ Página não usa PageLayout');
    score -= 25;
  }
  
  // 2. Verificar PageHeader (obrigatório)
  const hasPageHeader = pageContent.includes('PageHeader');
  if (!hasPageHeader) {
    errors.push('❌ Página não usa PageHeader');
    score -= 25;
  }
  
  // 3. Verificar cores proibidas
  const hasBlueColors = DESIGN_PATTERNS.FORBIDDEN_COLORS.some(
    color => pageContent.includes(color)
  );
  if (hasBlueColors) {
    errors.push('❌ Página contém cores azuis proibidas');
    score -= 20;
  }
  
  // 4. Verificar grid responsivo
  const hasResponsiveGrid = DESIGN_PATTERNS.RESPONSIVE_GRIDS.some(
    grid => pageContent.includes(grid)
  );
  if (!hasResponsiveGrid) {
    errors.push('⚠️ Página pode não ter grid responsivo otimizado');
    score -= 10;
  }
  
  // 5. Verificar tamanho do arquivo
  const lines = pageContent.split('\n').length;
  const fileSize: PageValidation['fileSize'] = 
    lines > 200 ? 'large' : 
    lines > 100 ? 'medium' : 'small';
  
  if (lines > DESIGN_PATTERNS.MAX_FILE_LINES) {
    errors.push(`❌ Arquivo muito grande (${lines} linhas). Máximo: ${DESIGN_PATTERNS.MAX_FILE_LINES}`);
    score -= 20;
  }
  
  return {
    pageName,
    hasPageLayout,
    hasPageHeader,
    hasConsistentColors: !hasBlueColors,
    isMobileOptimized: hasResponsiveGrid,
    fileSize,
    score: Math.max(0, score)
  };
}

/**
 * Valida todo o sistema de design
 */
export function validateDesignSystem(
  pages: Array<{ name: string; content: string }>
): DesignSystemValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  let totalScore = 0;
  const pageValidations: PageValidation[] = [];
  
  // Validar cada página
  pages.forEach(page => {
    const validation = validatePageStructure(page.content, page.name);
    pageValidations.push(validation);
    totalScore += validation.score;
  });
  
  // Calcular score médio
  const averageScore = pages.length > 0 ? totalScore / pages.length : 0;
  
  // Determinar status geral
  const isValid = averageScore >= 80;
  
  // Gerar relatório de problemas
  pageValidations.forEach(validation => {
    if (validation.score < 80) {
      errors.push(`Página ${validation.pageName} não atende aos padrões (${validation.score}%)`);
    }
    
    if (validation.fileSize === 'large') {
      warnings.push(`Página ${validation.pageName} precisa de modularização`);
    }
    
    if (!validation.hasPageLayout || !validation.hasPageHeader) {
      errors.push(`Página ${validation.pageName} não usa componentes base obrigatórios`);
    }
  });
  
  // Gerar recomendações
  if (averageScore < 90) {
    recommendations.push('Considere revisar páginas com scores baixos');
  }
  
  if (pageValidations.some(p => p.fileSize === 'large')) {
    recommendations.push('Modularize arquivos grandes em componentes menores');
  }
  
  if (pageValidations.some(p => !p.hasConsistentColors)) {
    recommendations.push('Substitua todas as cores azuis por verde');
  }
  
  return {
    isValid,
    score: averageScore,
    errors,
    warnings,
    recommendations
  };
}

/**
 * Gera relatório de validação em markdown
 */
export function generateValidationReport(
  validation: DesignSystemValidation,
  pageValidations?: PageValidation[]
): string {
  const status = validation.isValid ? '✅ APROVADO' : '❌ REPROVADO';
  const scoreEmoji = validation.score >= 90 ? '🏆' : 
                    validation.score >= 80 ? '✅' : 
                    validation.score >= 60 ? '⚠️' : '❌';
  
  let report = `# 🛡️ Relatório de Validação do Design System\n\n`;
  report += `## ${status} - Score: ${scoreEmoji} ${validation.score.toFixed(1)}%\n\n`;
  
  if (validation.errors.length > 0) {
    report += `### ❌ Erros Críticos\n`;
    validation.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += `\n`;
  }
  
  if (validation.warnings.length > 0) {
    report += `### ⚠️ Avisos\n`;
    validation.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
    report += `\n`;
  }
  
  if (validation.recommendations.length > 0) {
    report += `### 💡 Recomendações\n`;
    validation.recommendations.forEach(rec => {
      report += `- ${rec}\n`;
    });
    report += `\n`;
  }
  
  if (pageValidations) {
    report += `### 📊 Score por Página\n\n`;
    report += `| Página | Score | PageLayout | PageHeader | Cores | Mobile | Tamanho |\n`;
    report += `|--------|-------|------------|------------|-------|--------|---------|\n`;
    
    pageValidations.forEach(page => {
      const scoreEmoji = page.score >= 90 ? '🏆' : 
                        page.score >= 80 ? '✅' : 
                        page.score >= 60 ? '⚠️' : '❌';
      
      report += `| ${page.pageName} | ${scoreEmoji} ${page.score}% | ${page.hasPageLayout ? '✅' : '❌'} | ${page.hasPageHeader ? '✅' : '❌'} | ${page.hasConsistentColors ? '✅' : '❌'} | ${page.isMobileOptimized ? '✅' : '⚠️'} | ${page.fileSize} |\n`;
    });
  }
  
  report += `\n---\n\n`;
  report += `**Validação executada em**: ${new Date().toLocaleString('pt-BR')}\n`;
  
  return report;
}

/**
 * Padrões de qualidade para novas páginas
 */
export const QUALITY_CHECKLIST = {
  // ✅ OBRIGATÓRIO
  MUST_HAVE: [
    'Usar PageLayout com spacing e maxWidth apropriados',
    'Implementar PageHeader com título, descrição e ícone',
    'Usar apenas cores verdes (text-primary, bg-primary, etc.)',
    'Implementar grid responsivo (2 cards por linha em mobile)',
    'Touch targets de 44px+ para elementos interativos',
    'Manter arquivo com menos de 200 linhas'
  ],
  
  // ⚠️ RECOMENDADO  
  SHOULD_HAVE: [
    'Usar PageNavigation se aplicável',
    'Implementar skeleton loading states',
    'Adicionar animações suaves (animate-fade-in)',
    'Usar design tokens (--space-*, --radius-*)',
    'Implementar estados de erro e vazio',
    'Adicionar breadcrumbs quando apropriado'
  ],
  
  // 💡 BOAS PRÁTICAS
  NICE_TO_HAVE: [
    'Adicionar micro-interações',
    'Implementar temas claros/escuros consistentes',
    'Otimizar performance com lazy loading',
    'Adicionar testes unitários para componentes',
    'Documentar props e uso dos componentes',
    'Implementar acessibilidade (ARIA labels, etc.)'
  ]
};

/**
 * Executar validação rápida de um componente
 */
export function quickValidate(content: string): {
  hasRequiredPatterns: boolean;
  forbiddenPatterns: string[];
  score: number;
} {
  const requiredPatterns = ['PageLayout', 'PageHeader'];
  const forbiddenPatterns = DESIGN_PATTERNS.FORBIDDEN_COLORS.filter(
    color => content.includes(color)
  );
  
  const hasRequiredPatterns = requiredPatterns.every(
    pattern => content.includes(pattern)
  );
  
  let score = 100;
  if (!hasRequiredPatterns) score -= 30;
  if (forbiddenPatterns.length > 0) score -= 40;
  
  return {
    hasRequiredPatterns,
    forbiddenPatterns,
    score: Math.max(0, score)
  };
}

export default {
  validatePageStructure,
  validateDesignSystem,
  generateValidationReport,
  quickValidate,
  DESIGN_PATTERNS,
  QUALITY_CHECKLIST
}; 