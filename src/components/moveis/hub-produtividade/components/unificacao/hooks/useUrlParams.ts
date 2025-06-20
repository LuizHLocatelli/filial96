import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("atividades");

  // Debug dos parâmetros de URL
  useEffect(() => {
    const currentParams = Object.fromEntries(searchParams.entries());
    console.log('🔍 [useUrlParams] Parâmetros atuais:', currentParams);
    console.log('🔍 [useUrlParams] URL completa:', window.location.href);
  }, [searchParams]);

  const clearActionParam = () => {
    console.log('🧹 [useUrlParams] Limpando parâmetro action');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    setSearchParams(newParams);
    console.log('🧹 [useUrlParams] Parâmetros após limpeza:', Object.fromEntries(newParams.entries()));
  };

  const handleTabChange = (value: string) => {
    console.log('📌 [useUrlParams] Mudando tab para:', value);
    setSelectedTab(value);
  };

  return {
    searchParams,
    selectedTab,
    setSelectedTab,
    clearActionParam,
    handleTabChange,
  };
}
