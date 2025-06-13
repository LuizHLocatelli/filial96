
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState("atividades");

  const clearActionParam = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    setSearchParams(newParams);
  };

  const handleTabChange = (value: string) => {
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
