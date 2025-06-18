/**
 * Utilitário para Auditoria do Sistema de Design
 * Identifica páginas que precisam de padronização
 */

export interface PageAuditResult {
  pageName: string;
  filePath: string;
  issues: string[];
  score: number;
  status: 'compliant' | 'partial' | 'needs-refactor';
}

export interface AuditCriteria {
  usesPageLayout: boolean;
  usesPageHeader: boolean;
  usesPageNavigation: boolean;
  hasConsistentColors: boolean;
  isMobileResponsive: boolean;
  fileSizeUnder200Lines: boolean;
  usesStandardComponents: boolean;
}

/**
 * Critérios de avaliação para cada página
 */
export const auditCriteria = {
  // Páginas já padronizadas
  'Crediario': {
    usesPageLayout: true,
    usesPageHeader: true, 
    usesPageNavigation: true,
    hasConsistentColors: true,
    isMobileResponsive: true,
    fileSizeUnder200Lines: true,
    usesStandardComponents: true
  },
  
  // Páginas que precisam de verificação
  'HubProdutividade': {
    usesPageLayout: false, // Precisa verificar
    usesPageHeader: false, // Precisa verificar
    usesPageNavigation: false, // Precisa verificar
    hasConsistentColors: false, // Precisa verificar
    isMobileResponsive: false, // Precisa verificar
    fileSizeUnder200Lines: true,
    usesStandardComponents: false // Precisa verificar
  },
  
  'Moveis': {
    usesPageLayout: false,
    usesPageHeader: false,
    usesPageNavigation: false,
    hasConsistentColors: false,
    isMobileResponsive: false,
    fileSizeUnder200Lines: true,
    usesStandardComponents: false
  },
  
  'Moda': {
    usesPageLayout: false,
    usesPageHeader: false,
    usesPageNavigation: false,
    hasConsistentColors: false,
    isMobileResponsive: false,
    fileSizeUnder200Lines: true,
    usesStandardComponents: false
  },
  
  // Páginas com problemas críticos
  'Atividades': {
    usesPageLayout: false,
    usesPageHeader: false,
    usesPageNavigation: false,
    hasConsistentColors: false,
    isMobileResponsive: false,
    fileSizeUnder200Lines: false, // 535 linhas
    usesStandardComponents: false
  },
  
  'UserManagement': {
    usesPageLayout: false,
    usesPageHeader: false,
    usesPageNavigation: false,
    hasConsistentColors: false,
    isMobileResponsive: false,
    fileSizeUnder200Lines: false, // 791 linhas
    usesStandardComponents: false
  },
  
  'Profile': {
    usesPageLayout: false,
    usesPageHeader: false,
    usesPageNavigation: false,
    hasConsistentColors: false,
    isMobileResponsive: false,
    fileSizeUnder200Lines: true,
    usesStandardComponents: false
  }
};

/**
 * Calcula score de conformidade (0-100)
 */
export function calculateComplianceScore(criteria: AuditCriteria): number {
  const totalCriteria = Object.keys(criteria).length;
  const passedCriteria = Object.values(criteria).filter(Boolean).length;
  return Math.round((passedCriteria / totalCriteria) * 100);
}

/**
 * Determina status da página baseado no score
 */
export function getPageStatus(score: number): PageAuditResult['status'] {
  if (score >= 80) return 'compliant';
  if (score >= 40) return 'partial';
  return 'needs-refactor';
}

/**
 * Gera lista de issues baseada nos critérios
 */
export function generateIssues(criteria: AuditCriteria): string[] {
  const issues: string[] = [];
  
  if (!criteria.usesPageLayout) {
    issues.push('❌ Não usa PageLayout - precisa implementar estrutura padrão');
  }
  
  if (!criteria.usesPageHeader) {
    issues.push('❌ Não usa PageHeader - precisa padronizar cabeçalho');
  }
  
  if (!criteria.usesPageNavigation) {
    issues.push('❌ Não usa PageNavigation - precisa padronizar navegação');
  }
  
  if (!criteria.hasConsistentColors) {
    issues.push('⚠️ Cores inconsistentes - verificar sistema de cores verde');
  }
  
  if (!criteria.isMobileResponsive) {
    issues.push('⚠️ Responsividade mobile - verificar layout em dispositivos móveis');
  }
  
  if (!criteria.fileSizeUnder200Lines) {
    issues.push('❌ Arquivo muito grande - precisa modularização');
  }
  
  if (!criteria.usesStandardComponents) {
    issues.push('⚠️ Componentes não padronizados - usar Card, Button, etc. padrão');
  }
  
  return issues;
}

/**
 * Executa auditoria completa
 */
export function auditAllPages(): PageAuditResult[] {
  const results: PageAuditResult[] = [];
  
  Object.entries(auditCriteria).forEach(([pageName, criteria]) => {
    const score = calculateComplianceScore(criteria);
    const status = getPageStatus(score);
    const issues = generateIssues(criteria);
    
    results.push({
      pageName,
      filePath: `src/pages/${pageName}.tsx`,
      issues,
      score,
      status
    });
  });
  
  // Ordenar por score (piores primeiro)
  return results.sort((a, b) => a.score - b.score);
}

/**
 * Gera relatório de auditoria
 */
export function generateAuditReport(): string {
  const results = auditAllPages();
  const totalPages = results.length;
  const compliantPages = results.filter(r => r.status === 'compliant').length;
  const partialPages = results.filter(r => r.status === 'partial').length;
  const needsRefactorPages = results.filter(r => r.status === 'needs-refactor').length;
  
  let report = `# Relatório de Auditoria - Sistema de Design\n\n`;
  report += `## 📊 Resumo Geral\n`;
  report += `- **Total de páginas**: ${totalPages}\n`;
  report += `- **✅ Páginas conformes**: ${compliantPages} (${Math.round(compliantPages/totalPages*100)}%)\n`;
  report += `- **⚠️ Parcialmente conformes**: ${partialPages} (${Math.round(partialPages/totalPages*100)}%)\n`;
  report += `- **❌ Precisam refatoração**: ${needsRefactorPages} (${Math.round(needsRefactorPages/totalPages*100)}%)\n\n`;
  
  report += `## 📋 Detalhamento por Página\n\n`;
  
  results.forEach(result => {
    const statusIcon = result.status === 'compliant' ? '✅' : 
                      result.status === 'partial' ? '⚠️' : '❌';
    
    report += `### ${statusIcon} ${result.pageName} (Score: ${result.score}%)\n`;
    report += `**Arquivo**: \`${result.filePath}\`\n\n`;
    
    if (result.issues.length > 0) {
      report += `**Issues identificadas**:\n`;
      result.issues.forEach(issue => {
        report += `- ${issue}\n`;
      });
    } else {
      report += `**Status**: ✅ Página totalmente conforme com o sistema de design\n`;
    }
    
    report += `\n---\n\n`;
  });
  
  return report;
}

/**
 * Prioridades de refatoração
 */
export function getRefactoringPriorities(): PageAuditResult[] {
  const results = auditAllPages();
  
  // Priorizar por:
  // 1. Páginas com score muito baixo (< 20)
  // 2. Páginas com arquivos muito grandes
  // 3. Páginas com mais issues críticas
  
  return results
    .filter(r => r.status === 'needs-refactor')
    .sort((a, b) => {
      // Priorizar arquivos grandes
      const aHasLargeFile = a.issues.some(i => i.includes('muito grande'));
      const bHasLargeFile = b.issues.some(i => i.includes('muito grande'));
      
      if (aHasLargeFile && !bHasLargeFile) return -1;
      if (!aHasLargeFile && bHasLargeFile) return 1;
      
      // Depois por score
      return a.score - b.score;
    });
}

/**
 * Gera plano de ação
 */
export function generateActionPlan(): string {
  const priorities = getRefactoringPriorities();
  
  let plan = `# Plano de Ação - Padronização Sistema de Design\n\n`;
  plan += `## 🎯 Ordem de Prioridade para Refatoração\n\n`;
  
  priorities.forEach((page, index) => {
    plan += `### ${index + 1}. ${page.pageName} (Score: ${page.score}%)\n`;
    plan += `**Arquivo**: \`${page.filePath}\`\n`;
    plan += `**Estimativa**: ${page.issues.length > 5 ? '4-6 horas' : '2-3 horas'}\n\n`;
    
    plan += `**Actions necessárias**:\n`;
    page.issues.forEach(issue => {
      plan += `- ${issue}\n`;
    });
    
    plan += `\n`;
  });
  
  plan += `## 📅 Cronograma Sugerido\n\n`;
  plan += `- **Semana 1**: Refatorar páginas críticas (UserManagement, Atividades)\n`;
  plan += `- **Semana 2**: Padronizar páginas principais (HubProdutividade, Moveis, Moda)\n`;
  plan += `- **Semana 3**: Ajustes finais e testes (Profile, outras páginas menores)\n`;
  plan += `- **Semana 4**: Documentação e guidelines para futuras páginas\n\n`;
  
  return plan;
}

// Exportar função principal para uso em development
export const runDesignAudit = () => {
  console.log('🔍 Executando Auditoria do Sistema de Design...\n');
  
  const report = generateAuditReport();
  console.log(report);
  
  const actionPlan = generateActionPlan();
  console.log(actionPlan);
  
  return { report, actionPlan };
}; 