import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useApplication } from '../ApplicationContext/ApplicationContext';
import avaliacaoService, { AvaliacaoReportFilters, AvaliacaoReportResponse } from '../../services/avaliacaoService'
import complaintService, {
  ComplaintReportFilters,
  ComplaintReportResponse,
  ComplaintStatus,
} from '../../services/complaintService'

export type ReportTab = 'avaliacoes' | 'reclamacoes'

export interface ReportsFiltersState {
  search: string;
  startDate: string;
  endDate: string;
  notaMin: string;
  notaMax: string;
  fornecedorNome: string;
  clienteNome: string;
  status: string;
}

type ReportDataMap = {
  avaliacoes: AvaliacaoReportResponse | null
  reclamacoes: ComplaintReportResponse | null
}

interface ReportsContextValue {
  activeTab: ReportTab;
  setActiveTab: (tab: ReportTab) => void;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reportData: ReportDataMap;
  filters: ReportsFiltersState;
  setFilterValue: (field: keyof ReportsFiltersState, value: string) => void;
  resetFilters: () => void;
  fetchReports: () => Promise<void>;
  refreshReports: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined);

const INITIAL_FILTERS: ReportsFiltersState = {
  search: '',
  startDate: '',
  endDate: '',
  notaMin: '',
  notaMax: '',
  fornecedorNome: '',
  clienteNome: '',
  status: '',
};

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApplication()
  const isAdmin = user?.pessoa_tipo === 'Admin'
  const isFornecedor = user?.pessoa_tipo === 'Juridica'

  const [activeTab, setActiveTabState] = useState<ReportTab>('avaliacoes')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportDataMap>({ avaliacoes: null, reclamacoes: null })
  const [filters, setFilters] = useState<ReportsFiltersState>({ ...INITIAL_FILTERS })

  const buildParams = useCallback(
    (tab: ReportTab): AvaliacaoReportFilters | ComplaintReportFilters => {
      const params: Record<string, any> = {
        page,
        limit: 8,
      }

      if (filters.search.trim()) params.search = filters.search.trim()
      if (filters.startDate.trim()) params.startDate = filters.startDate.trim()
      if (filters.endDate.trim()) params.endDate = filters.endDate.trim()

      if (tab === 'avaliacoes') {
        if (filters.notaMin.trim()) params.notaMin = Number(filters.notaMin.trim())
        if (filters.notaMax.trim()) params.notaMax = Number(filters.notaMax.trim())
      } else if (filters.status) {
        params.status = filters.status.toUpperCase() as ComplaintStatus
      }

      if (isAdmin && filters.fornecedorNome.trim()) {
        params.fornecedorNome = filters.fornecedorNome.trim()
      }
      if (isAdmin && filters.clienteNome.trim()) {
        params.clienteNome = filters.clienteNome.trim()
      }

      if (!isAdmin && isFornecedor && user?.pessoa_id) {
        params.fornecedorId = Number(user.pessoa_id)
      }

      return params as AvaliacaoReportFilters | ComplaintReportFilters
    },
    [filters, isAdmin, isFornecedor, page, user?.pessoa_id],
  )

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = buildParams(activeTab)
      if (activeTab === 'avaliacoes') {
        const response = await avaliacaoService.listarAvaliacoes(params as AvaliacaoReportFilters)
        setReportData((prev) => ({ ...prev, avaliacoes: response }))
      } else {
        const response = await complaintService.listComplaintReports(params as ComplaintReportFilters)
        setReportData((prev) => ({ ...prev, reclamacoes: response }))
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Não foi possível carregar os relatórios.'
      setError(message)
      setReportData((prev) => (
        activeTab === 'avaliacoes'
          ? { ...prev, avaliacoes: null }
          : { ...prev, reclamacoes: null }
      ))
    } finally {
      setLoading(false)
    }
  }, [activeTab, buildParams])

  const refreshReports = useCallback(async () => {
    setRefreshing(true)
    await fetchReports()
    setRefreshing(false)
  }, [fetchReports])

  const setFilterValue = useCallback((field: keyof ReportsFiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ ...INITIAL_FILTERS })
    setPage(1)
  }, [])

  const handleSetActiveTab = useCallback((tab: ReportTab) => {
    setActiveTabState(tab)
    setPage(1)
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const value = useMemo<ReportsContextValue>(
    () => ({
      activeTab,
      setActiveTab: handleSetActiveTab,
      page,
      setPage,
      loading,
      refreshing,
      error,
      reportData,
      filters,
      setFilterValue,
      resetFilters,
      fetchReports,
      refreshReports,
    }),
    [
      activeTab,
      handleSetActiveTab,
      page,
      loading,
      refreshing,
      error,
      reportData,
      filters,
      setFilterValue,
      resetFilters,
      fetchReports,
      refreshReports,
    ],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};

export const useReports = (): ReportsContextValue => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};

