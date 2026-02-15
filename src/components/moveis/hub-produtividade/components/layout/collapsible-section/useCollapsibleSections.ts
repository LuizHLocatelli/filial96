import { useState } from 'react';

export function useCollapsibleSections(sections: string[]) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections)
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  const isExpanded = (sectionId: string) => {
    return expandedSections.has(sectionId);
  };

  return {
    expandedSections,
    toggleSection,
    expandAll,
    collapseAll,
    isExpanded
  };
}
