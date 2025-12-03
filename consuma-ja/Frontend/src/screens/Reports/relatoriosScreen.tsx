import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Modal,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { useApplication } from '../../contexts/ApplicationContext/ApplicationContext';
import { AvaliacaoReportItem } from '../../services/avaliacaoService';
import { ComplaintReportItem, ComplaintStatus } from '../../services/complaintService';
import orderService from '../../services/orderService';
import { tableStyles } from '../../components/Common/managementTable/tableStyles';
import { TableContent } from '../../components/Common/managementTable/TableContent';
import { Body } from '../../components/Common/managementTable/Body';
import { reportsStyles } from '../../common/styles/Reports/reportScreen.styled';
import { ReportTab, ReportsProvider, useReports } from '../../contexts/ReportsContext/reportsContext';

type UserRole = 'Admin' | 'Fornecedor' | 'Cliente';

const RELATORIO_TABS: Array<{ key: ReportTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: 'avaliacoes', label: 'Avaliações de Compra', icon: 'star-outline' },
  { key: 'reclamacoes', label: 'Reclamações de Pedido', icon: 'alert-circle-outline' },
];

const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  PENDENTE: 'Pendente',
  ANALISE: 'Em análise',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
}

const COMPLAINT_STATUS_THEMES: Record<ComplaintStatus, { backgroundColor: string; color: string }> = {
  PENDENTE: { backgroundColor: '#fff3cd', color: '#8a6d1a' },
  ANALISE: { backgroundColor: '#e0f2ff', color: '#0d47a1' },
  APROVADA: { backgroundColor: '#d1e7dd', color: '#0f5132' },
  REJEITADA: { backgroundColor: '#fdecea', color: '#842029' },
}

const COMPLAINT_STATUS_FILTERS: Array<{ value: ComplaintStatus | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'ANALISE', label: 'Em análise' },
  { value: 'PENDENTE', label: 'Pendentes' },
  { value: 'APROVADA', label: 'Aprovadas' },
  { value: 'REJEITADA', label: 'Rejeitadas' },
]

const isPendingComplaint = (status: ComplaintStatus) => status === 'PENDENTE' || status === 'ANALISE'

const parseNotaMedia = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const DATE_MASK_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/

const applyDateMask = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  let masked = day
  if (month) {
    masked += (masked ? '/' : '') + month
  }
  if (year) {
    masked += (masked ? '/' : '') + year
  }
  return masked
}

const displayFromIso = (value: string) => {
  if (!value) return ''
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return ''
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

const isoFromDisplay = (value: string) => {
  if (!DATE_MASK_REGEX.test(value)) return ''
  const [, day, month, year] = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) || []
  if (!day || !month || !year) return ''
  return `${year}-${month}-${day}`
}

const RelatoriosContent: React.FC = () => {
  const { user } = useApplication();
  const userRole: UserRole = useMemo(() => {
    if (!user?.pessoa_tipo) return 'Cliente';
    if (user.pessoa_tipo === 'Admin') return 'Admin';
    if (user.pessoa_tipo === 'Juridica') return 'Fornecedor';
    return 'Cliente';
  }, [user?.pessoa_tipo]);

  const isAdmin = userRole === 'Admin';
  const isFornecedor = userRole === 'Fornecedor';

  const {
    activeTab,
    setActiveTab,
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
  } = useReports();

  const avaliacaoResponse = reportData.avaliacoes
  const complaintResponse = reportData.reclamacoes
  const currentResponse = activeTab === 'avaliacoes' ? avaliacaoResponse : complaintResponse

  const [selectedReport, setSelectedReport] = useState<AvaliacaoReportItem | null>(null)
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintReportItem | null>(null)
  const [updatingComplaintId, setUpdatingComplaintId] = useState<number | null>(null)

  const [startDateInput, setStartDateInput] = useState(() => displayFromIso(filters.startDate))
  const [endDateInput, setEndDateInput] = useState(() => displayFromIso(filters.endDate))

  useEffect(() => {
    setStartDateInput(displayFromIso(filters.startDate))
  }, [filters.startDate])

  useEffect(() => {
    setEndDateInput(displayFromIso(filters.endDate))
  }, [filters.endDate])

  const handleFilterChange = useCallback(
    (field: keyof typeof filters, value: string) => {
      setFilterValue(field, value);
    },
    [setFilterValue],
  );

  const handleDateInputChange = useCallback((field: 'startDate' | 'endDate', rawValue: string) => {
    const masked = applyDateMask(rawValue)
    if (field === 'startDate') {
      setStartDateInput(masked)
    } else {
      setEndDateInput(masked)
    }

    if (!masked) {
      setFilterValue(field, '')
      return
    }

    if (DATE_MASK_REGEX.test(masked)) {
      const iso = isoFromDisplay(masked)
      if (iso) {
        setFilterValue(field, iso)
      }
    }
  }, [setFilterValue])

  const formatCurrency = useCallback((value: number | null | undefined) => {
    return `R$ ${Number(value ?? 0).toFixed(2)}`
  }, [])

  const columns = useMemo(
    () => [
      { key: 'id', label: '#', flex: 0.6 },
      { key: 'cliente', label: 'Cliente', flex: 1.4 },
      { key: 'nota', label: 'Nota', flex: 0.8 },
      { key: 'produto', label: 'Promoção / Produtos', flex: 1.8 },
      { key: 'fornecedor', label: 'Fornecedor', flex: 1.2 },
      { key: 'data', label: 'Data', flex: 1 },
    ],
    [],
  );

  const complaintColumns = useMemo(
    () => [
      { key: 'id', label: '#', flex: 0.6 },
      { key: 'pedido', label: 'Pedido', flex: 0.8 },
      { key: 'cliente', label: 'Cliente', flex: 1.2 },
      { key: 'fornecedor', label: 'Fornecedor', flex: 1.2 },
      { key: 'status', label: 'Status', flex: 1 },
      { key: 'data', label: 'Data', flex: 1 },
    ],
    [],
  )

  const renderRow = (item: AvaliacaoReportItem, index: number) => {
    const rowStyle = index % 2 === 0 ? tableStyles.bodyRowEven : tableStyles.bodyRowOdd;
    const data = new Date(item.avaliacao_data);
    const dataFormatada = Number.isNaN(data.getTime()) ? '-' : data.toLocaleDateString('pt-BR');
    const notaMediaValue = parseNotaMedia(item.nota_media)
    const nota = notaMediaValue !== null ? notaMediaValue.toFixed(1) : '-'
    const produtosText = item.promocao?.descricao
      ? `${item.promocao.descricao}${item.produtos.length ? ' • ' : ''}`
      : '';
    const produtosDetalhes = item.produtos.map((prod) => `${prod.nome} (${prod.quantidade}x)`).join(', ');

    return (
      <TouchableOpacity
        key={`avaliacao-${item.avaliacao_id}`}
        style={[tableStyles.bodyRow, rowStyle]}
        activeOpacity={0.8}
        onPress={() => setSelectedReport(item)}
      >
        <Text style={[tableStyles.bodyCell, { flex: columns[0].flex }]}>{item.avaliacao_id}</Text>
        <Text style={[tableStyles.bodyCell, { flex: columns[1].flex }]}>{item.cliente.nome}</Text>
        <Text style={[tableStyles.bodyCell, { flex: columns[2].flex }]}>
          {nota}
          {nota !== '-' ? ' ★' : ''}
        </Text>
        <Text style={[tableStyles.bodyCell, { flex: columns[3].flex }]} numberOfLines={2}>
          {produtosText}
          {produtosDetalhes}
        </Text>
        <Text style={[tableStyles.bodyCell, { flex: columns[4].flex }]}>
          {item.fornecedor?.nome || '—'}
        </Text>
        <Text style={[tableStyles.bodyCell, { flex: columns[5].flex }]}>{dataFormatada}</Text>
      </TouchableOpacity>
    );
  };

  const renderComplaintRow = (item: ComplaintReportItem, index: number) => {
    const rowStyle = index % 2 === 0 ? tableStyles.bodyRowEven : tableStyles.bodyRowOdd
    const data = new Date(item.criadoEm)
    const dataFormatada = Number.isNaN(data.getTime()) ? '-' : data.toLocaleDateString('pt-BR')
    const statusTheme = COMPLAINT_STATUS_THEMES[item.status]

    return (
      <TouchableOpacity
        key={`complaint-${item.id}`}
        style={[tableStyles.bodyRow, rowStyle]}
        activeOpacity={0.8}
        onPress={() => setSelectedComplaint(item)}
      >
        <Text style={[tableStyles.bodyCell, { flex: complaintColumns[0].flex }]}>#{item.id}</Text>
        <Text style={[tableStyles.bodyCell, { flex: complaintColumns[1].flex }]}>#{item.vendaId}</Text>
        <Text style={[tableStyles.bodyCell, { flex: complaintColumns[2].flex }]} numberOfLines={2}>
          {item.cliente.nome}
        </Text>
        <Text style={[tableStyles.bodyCell, { flex: complaintColumns[3].flex }]} numberOfLines={2}>
          {item.fornecedor?.nome || '—'}
        </Text>
        <View style={[tableStyles.bodyCell, { flex: complaintColumns[4].flex }]}>
          <View style={[reportsStyles.statusBadge, { backgroundColor: statusTheme.backgroundColor }]}>
            <Text style={[reportsStyles.statusBadgeText, { color: statusTheme.color }]}>
              {COMPLAINT_STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>
        <Text style={[tableStyles.bodyCell, { flex: complaintColumns[5].flex }]}>{dataFormatada}</Text>
      </TouchableOpacity>
    )
  }

  const renderEvaluationTable = () => (
    <View style={reportsStyles.card}>
      <TableContent
        isEmpty={!avaliacaoResponse?.data?.length}
        emptyMessage={error || 'Nenhum registro encontrado.'}
      >
        <View style={tableStyles.head}>
          <View style={tableStyles.headRow}>
            {columns.map((column) => (
              <Text key={column.key} style={[tableStyles.headCell, { flex: column.flex }]}>
                {column.label}
              </Text>
            ))}
          </View>
        </View>

        <Body isEmpty={!avaliacaoResponse?.data?.length}>
          {avaliacaoResponse?.data?.map((item, index) => renderRow(item, index))}
        </Body>

        <View style={tableStyles.footer}>
          <View style={tableStyles.footerContent}>
            <Text style={tableStyles.footerText}>
              Página {avaliacaoResponse ? page : 0} de {totalPages}
            </Text>
            <View style={reportsStyles.paginationButtons}>
              <TouchableOpacity
                style={[reportsStyles.pageButton, !canGoPrev && reportsStyles.pageButtonDisabled]}
                onPress={() => canGoPrev && setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev}
              >
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[reportsStyles.pageButton, !canGoNext && reportsStyles.pageButtonDisabled]}
                onPress={() => canGoNext && setPage((prev) => prev + 1)}
                disabled={!canGoNext}
              >
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TableContent>
      {loading ? (
        <View style={reportsStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1b5e20" />
        </View>
      ) : null}
    </View>
  )

  const renderComplaintTable = () => (
    <View style={reportsStyles.card}>
      <TableContent
        isEmpty={!complaintResponse?.data?.length}
        emptyMessage={error || 'Nenhum registro encontrado.'}
      >
        <View style={tableStyles.head}>
          <View style={tableStyles.headRow}>
            {complaintColumns.map((column) => (
              <Text key={column.key} style={[tableStyles.headCell, { flex: column.flex }]}>
                {column.label}
              </Text>
            ))}
          </View>
        </View>

        <Body isEmpty={!complaintResponse?.data?.length}>
          {complaintResponse?.data?.map((item, index) => renderComplaintRow(item, index))}
        </Body>

        <View style={tableStyles.footer}>
          <View style={tableStyles.footerContent}>
            <Text style={tableStyles.footerText}>
              Página {complaintResponse ? page : 0} de {totalPages}
            </Text>
            <View style={reportsStyles.paginationButtons}>
              <TouchableOpacity
                style={[reportsStyles.pageButton, !canGoPrev && reportsStyles.pageButtonDisabled]}
                onPress={() => canGoPrev && setPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev}
              >
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[reportsStyles.pageButton, !canGoNext && reportsStyles.pageButtonDisabled]}
                onPress={() => canGoNext && setPage((prev) => prev + 1)}
                disabled={!canGoNext}
              >
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TableContent>
      {loading ? (
        <View style={reportsStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1b5e20" />
        </View>
      ) : null}
    </View>
  )
  const handleComplaintAction = useCallback(
    async (complaint: ComplaintReportItem, nextStatus: ComplaintStatus) => {
      try {
        setUpdatingComplaintId(complaint.id)
        await orderService.updateComplaintStatus(complaint.id, {
          status: nextStatus,
          actorId: user?.pessoa_id,
          actorTipo: user?.pessoa_tipo,
        })
        await fetchReports()
        setSelectedComplaint(null)
        Alert.alert(
          'Reclamação atualizada',
          `A reclamação #${complaint.id} foi ${nextStatus === 'APROVADA' ? 'aprovada' : 'rejeitada'}.`,
        )
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Não foi possível atualizar a reclamação.'
        Alert.alert('Erro ao atualizar', message)
      } finally {
        setUpdatingComplaintId(null)
      }
    },
    [fetchReports, user?.pessoa_id, user?.pessoa_tipo],
  )

  const confirmComplaintAction = useCallback(
    (complaint: ComplaintReportItem, status: ComplaintStatus) => {
      const actionLabel = status === 'APROVADA' ? 'aprovar' : 'rejeitar'
      const execute = () => handleComplaintAction(complaint, status)
      if (Platform.OS === 'web') {
        const confirmed = typeof window !== 'undefined' ? window.confirm(`Deseja ${actionLabel} a reclamação #${complaint.id}?`) : true
        if (confirmed) {
          execute()
        }
        return
      }
      Alert.alert(
        `Confirmar ${actionLabel}`,
        `Deseja ${actionLabel} a reclamação #${complaint.id}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            style: 'default',
            onPress: execute,
          },
        ],
      )
    },
    [handleComplaintAction],
  )

  const summaryCards = useMemo(() => {
    if (activeTab === 'avaliacoes') {
      const data = avaliacaoResponse?.data ?? []
      const total = avaliacaoResponse?.total ?? 0
      const notas = data
        .map((item) => parseNotaMedia(item.nota_media))
        .filter((nota): nota is number => nota !== null)
      const notaMedia = notas.length ? (notas.reduce((acc, value) => acc + value, 0) / notas.length).toFixed(1) : '--'
      const ultimaData = data.reduce<Date | null>((latest, item) => {
        const current = new Date(item.avaliacao_data)
        if (Number.isNaN(current.getTime())) return latest
        if (!latest || current > latest) return current
        return latest
      }, null)
      const ultimaDataFormatada = ultimaData ? ultimaData.toLocaleDateString('pt-BR') : '--'
      const comDescricao = data.filter((item) => item.avaliacao_descricao).length

      return [
        {
          key: 'total',
          label: 'Avaliações registradas',
          value: total.toString().padStart(2, '0'),
          description: 'Total considerando todos os filtros aplicados.',
          icon: 'documents-outline' as const,
        },
        {
          key: 'media',
          label: 'Nota média',
          value: notaMedia,
          description: 'Calculada com base nos itens da página atual.',
          icon: 'star-half-outline' as const,
        },
        {
          key: 'ultima',
          label: 'Última avaliação',
          value: ultimaDataFormatada,
          description: 'Data mais recente dentro do período filtrado.',
          icon: 'time-outline' as const,
        },
        {
          key: 'detalhadas',
          label: 'Com descrição',
          value: comDescricao.toString(),
          description: 'Clientes que justificaram a nota atribuída.',
          icon: 'chatbubble-ellipses-outline' as const,
        },
      ]
    }

    const stats = complaintResponse?.stats
    const totalReclamacoes = complaintResponse?.total ?? 0
    const pendentes = stats?.pendente ?? 0
    const analise = stats?.analise ?? 0
    const aprovadas = stats?.aprovada ?? 0
    const rejeitadas = stats?.rejeitada ?? 0

    return [
      {
        key: 'total-complaints',
        label: 'Reclamações registradas',
        value: totalReclamacoes.toString().padStart(2, '0'),
        description: 'Total considerando os filtros aplicados.',
        icon: 'alert-circle-outline' as const,
      },
      {
        key: 'analise',
        label: 'Em análise',
        value: analise.toString(),
        description: 'Aguardam decisão do fornecedor.',
        icon: 'hourglass-outline' as const,
      },
      {
        key: 'pendentes',
        label: 'Pendentes',
        value: pendentes.toString(),
        description: 'Ainda não revisadas.',
        icon: 'time-outline' as const,
      },
      {
        key: 'resultado',
        label: 'Aprovadas',
        value: aprovadas.toString(),
        description: `${rejeitadas} reclamações foram negadas.`,
        icon: 'checkmark-done-outline' as const,
      },
    ]
  }, [activeTab, avaliacaoResponse, complaintResponse])

  const handleClearFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const handleRefresh = useCallback(() => {
    refreshReports();
  }, [refreshReports]);

  const renderEvaluationFilters = () => (
    <View style={reportsStyles.filtersContainer}>
      <TextInput
        style={reportsStyles.filterInput}
        value={filters.search}
        onChangeText={(value) => handleFilterChange('search', value)}
        placeholder="Buscar por cliente, fornecedor ou produto"
        placeholderTextColor="#9aa0a6"
      />
      <View style={reportsStyles.filterRow}>
        <View style={reportsStyles.filterColumn}>
          <Text style={reportsStyles.filterLabel}>Data inicial</Text>
          <TextInput
            style={reportsStyles.filterInput}
            value={startDateInput}
            onChangeText={(value) => handleDateInputChange('startDate', value)}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        <View style={reportsStyles.filterColumn}>
          <Text style={reportsStyles.filterLabel}>Data final</Text>
          <TextInput
            style={reportsStyles.filterInput}
            value={endDateInput}
            onChangeText={(value) => handleDateInputChange('endDate', value)}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        <View style={reportsStyles.filterColumn}>
          <Text style={reportsStyles.filterLabel}>Nota mín.</Text>
          <TextInput
            style={reportsStyles.filterInput}
            value={filters.notaMin}
            onChangeText={(value) => handleFilterChange('notaMin', value)}
            placeholder="1 a 5"
            keyboardType="numeric"
            maxLength={1}
          />
        </View>
        <View style={reportsStyles.filterColumn}>
          <Text style={reportsStyles.filterLabel}>Nota máx.</Text>
          <TextInput
            style={reportsStyles.filterInput}
            value={filters.notaMax}
            onChangeText={(value) => handleFilterChange('notaMax', value)}
            placeholder="1 a 5"
            keyboardType="numeric"
            maxLength={1}
          />
        </View>
      </View>
      {isAdmin ? (
      <View style={reportsStyles.filterRow}>
        <View style={reportsStyles.filterColumn}>
        <Text style={reportsStyles.filterLabel}>Fornecedor</Text>
        <TextInput
          style={reportsStyles.filterInput}
          value={filters.fornecedorNome}
          onChangeText={(value) => handleFilterChange('fornecedorNome', value)}
          placeholder="Nome do fornecedor"
          autoCapitalize="words"
        />
        </View>
        <View style={reportsStyles.filterColumn}>
        <Text style={reportsStyles.filterLabel}>Cliente</Text>
        <TextInput
          style={reportsStyles.filterInput}
          value={filters.clienteNome}
          onChangeText={(value) => handleFilterChange('clienteNome', value)}
          placeholder="Nome do cliente"
          autoCapitalize="words"
        />
        </View>
      </View>
      ) : null}
      {isFornecedor ? (
        <View style={reportsStyles.infoBanner}>
          <Ionicons name="information-circle-outline" size={18} color="#0c5460" />
          <Text style={reportsStyles.infoBannerText}>Você está visualizando apenas avaliações das suas vendas.</Text>
        </View>
      ) : null}
      <View style={reportsStyles.filtersFooter}>
        <TouchableOpacity style={reportsStyles.clearFiltersButton} onPress={handleClearFilters}>
          <Ionicons name="close-circle-outline" size={16} color="#0f5132" />
          <Text style={reportsStyles.clearFiltersText}>Limpar filtros</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderComplaintFilters = () => (
    <View style={reportsStyles.filtersContainer}>
      <TextInput
        style={reportsStyles.filterInput}
        value={filters.search}
        onChangeText={(value) => handleFilterChange('search', value)}
        placeholder="Buscar por cliente, fornecedor ou pedido"
        placeholderTextColor="#9aa0a6"
      />
      <View style={reportsStyles.filterRow}>
        <View style={reportsStyles.filterColumn}>
          <Text style={reportsStyles.filterLabel}>Data inicial</Text>
          <TextInput
            style={reportsStyles.filterInput}
            value={startDateInput}
            onChangeText={(value) => handleDateInputChange('startDate', value)}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        <View style={reportsStyles.filterColumn}>
          <Text style={reportsStyles.filterLabel}>Data final</Text>
          <TextInput
            style={reportsStyles.filterInput}
            value={endDateInput}
            onChangeText={(value) => handleDateInputChange('endDate', value)}
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
      </View>
      <View style={reportsStyles.filterColumnFull}>
        <Text style={reportsStyles.filterLabel}>Status</Text>
        <View style={reportsStyles.chipRow}>
          {COMPLAINT_STATUS_FILTERS.map((option) => {
            const isActive = filters.status === option.value
            return (
              <TouchableOpacity
                key={option.value || 'all'}
                style={[reportsStyles.chip, isActive && reportsStyles.chipSelected]}
                onPress={() => handleFilterChange('status', option.value)}
              >
                <Text style={[reportsStyles.chipLabel, isActive && reportsStyles.chipLabelSelected]}>{option.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
      {isAdmin ? (
      <View style={reportsStyles.filterRow}>
        <View style={reportsStyles.filterColumn}>
        <Text style={reportsStyles.filterLabel}>Fornecedor</Text>
        <TextInput
          style={reportsStyles.filterInput}
          value={filters.fornecedorNome}
          onChangeText={(value) => handleFilterChange('fornecedorNome', value)}
          placeholder="Nome do fornecedor"
          autoCapitalize="words"
        />
        </View>
        <View style={reportsStyles.filterColumn}>
        <Text style={reportsStyles.filterLabel}>Cliente</Text>
        <TextInput
          style={reportsStyles.filterInput}
          value={filters.clienteNome}
          onChangeText={(value) => handleFilterChange('clienteNome', value)}
          placeholder="Nome do cliente"
          autoCapitalize="words"
        />
        </View>
      </View>
      ) : null}
      {isFornecedor ? (
        <View style={reportsStyles.infoBanner}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#0c5460" />
          <Text style={reportsStyles.infoBannerText}>
            Apenas reclamações dos seus pedidos aparecem aqui. Utilize o histórico de vendas para agir rapidamente.
          </Text>
        </View>
      ) : null}
      <View style={reportsStyles.filtersFooter}>
        <TouchableOpacity style={reportsStyles.clearFiltersButton} onPress={handleClearFilters}>
          <Ionicons name="close-circle-outline" size={16} color="#0f5132" />
          <Text style={reportsStyles.clearFiltersText}>Limpar filtros</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderFilters = () => (activeTab === 'reclamacoes' ? renderComplaintFilters() : renderEvaluationFilters())

  const totalPages = currentResponse?.totalPages ?? 0
  const canGoPrev = page > 1;
  const canGoNext = totalPages > 0 && page < totalPages;

  const renderDetailModal = () => {
    const selectedNotaMedia = selectedReport ? parseNotaMedia(selectedReport.nota_media) : null
    return (
    <Modal visible={!!selectedReport} transparent animationType="slide" onRequestClose={() => setSelectedReport(null)}>
      <View style={reportsStyles.modalBackdrop}>
        <View style={reportsStyles.modalContent}>
          <View style={reportsStyles.modalHeader}>
            <Text style={reportsStyles.modalTitle}>Detalhes da avaliação</Text>
            <TouchableOpacity onPress={() => setSelectedReport(null)}>
              <Ionicons name="close" size={22} color="#1b5e20" />
            </TouchableOpacity>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Cliente</Text>
            <Text style={reportsStyles.modalValue}>{selectedReport?.cliente.nome}</Text>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Fornecedor</Text>
            <Text style={reportsStyles.modalValue}>{selectedReport?.fornecedor?.nome || '—'}</Text>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Nota média</Text>
            <Text style={reportsStyles.modalValue}>
              {selectedNotaMedia !== null ? `${selectedNotaMedia.toFixed(1)} / 5` : 'Sem nota'}
            </Text>
          </View>
          {selectedReport?.avaliacao_descricao ? (
            <View style={reportsStyles.modalSection}>
              <Text style={reportsStyles.modalLabel}>Comentário do cliente</Text>
              <Text style={reportsStyles.modalDescription}>{selectedReport.avaliacao_descricao}</Text>
            </View>
          ) : null}
          {selectedReport?.produtos?.length ? (
            <View style={reportsStyles.modalSection}>
              <Text style={reportsStyles.modalLabel}>Itens avaliados</Text>
              {selectedReport.produtos.map((produto) => (
                <Text key={`${selectedReport.avaliacao_id}-${produto.nome}`} style={reportsStyles.modalValue}>
                  {produto.nome} — {produto.quantidade}x
                </Text>
              ))}
            </View>
          ) : null}
          <TouchableOpacity style={reportsStyles.modalCloseButton} onPress={() => setSelectedReport(null)}>
            <Text style={reportsStyles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
  }

  const renderComplaintModal = () => {
    if (!selectedComplaint) {
      return null
    }
    return (
      <Modal
        visible
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedComplaint(null)}
      >
      <View style={reportsStyles.modalBackdrop}>
        <View style={reportsStyles.modalContent}>
          <View style={reportsStyles.modalHeader}>
            <Text style={reportsStyles.modalTitle}>Detalhes da reclamação</Text>
            <TouchableOpacity onPress={() => setSelectedComplaint(null)}>
              <Ionicons name="close" size={22} color="#1b5e20" />
            </TouchableOpacity>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Pedido</Text>
            <Text style={reportsStyles.modalValue}>#{selectedComplaint.vendaId}</Text>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Cliente</Text>
            <Text style={reportsStyles.modalValue}>{selectedComplaint.cliente.nome}</Text>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Fornecedor</Text>
            <Text style={reportsStyles.modalValue}>{selectedComplaint.fornecedor?.nome || '—'}</Text>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Status atual</Text>
            <View
              style={[
                reportsStyles.statusBadge,
                { backgroundColor: COMPLAINT_STATUS_THEMES[selectedComplaint.status].backgroundColor },
              ]}
            >
              <Text
                style={[
                  reportsStyles.statusBadgeText,
                  { color: COMPLAINT_STATUS_THEMES[selectedComplaint.status].color },
                ]}
              >
                {COMPLAINT_STATUS_LABELS[selectedComplaint.status]}
              </Text>
            </View>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Motivo</Text>
            <Text style={reportsStyles.modalDescription}>{selectedComplaint.motivo || '—'}</Text>
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Itens</Text>
            {selectedComplaint.itens?.length ? (
              selectedComplaint.itens.map((item) => (
                <Text key={`${selectedComplaint.id}-${item.loteId}`} style={reportsStyles.modalValue}>
                  {item.quantidade}x {item.produtoNome || `Lote ${item.loteId}`}
                </Text>
              ))
            ) : (
              <Text style={reportsStyles.modalValue}>Itens não informados.</Text>
            )}
          </View>
          <View style={reportsStyles.modalSection}>
            <Text style={reportsStyles.modalLabel}>Total da venda</Text>
            <Text style={reportsStyles.modalValue}>{formatCurrency(selectedComplaint.valorTotal || 0)}</Text>
          </View>
          {isPendingComplaint(selectedComplaint.status) && (isAdmin || isFornecedor) ? (
            <View style={reportsStyles.modalActionsRow}>
              <TouchableOpacity
                style={[reportsStyles.modalActionButton, reportsStyles.modalActionButtonSuccess]}
                onPress={() => confirmComplaintAction(selectedComplaint, 'APROVADA')}
                disabled={updatingComplaintId === selectedComplaint.id}
              >
                {updatingComplaintId === selectedComplaint.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={reportsStyles.modalActionButtonText}>Aprovar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[reportsStyles.modalActionButton, reportsStyles.modalActionButtonDanger]}
                onPress={() => confirmComplaintAction(selectedComplaint, 'REJEITADA')}
                disabled={updatingComplaintId === selectedComplaint.id}
              >
                {updatingComplaintId === selectedComplaint.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={reportsStyles.modalActionButtonText}>Rejeitar</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
          <TouchableOpacity style={reportsStyles.modalCloseButton} onPress={() => setSelectedComplaint(null)}>
            <Text style={reportsStyles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
      </Modal>
    )
  }

  return (
    <View style={reportsStyles.container}>
      <View style={reportsStyles.header}>
        <Text style={reportsStyles.title}>Relatórios</Text>
        <TouchableOpacity style={reportsStyles.refreshButton} onPress={fetchReports}>
          <Ionicons name="refresh" color="#fff" size={18} />
          <Text style={reportsStyles.refreshButtonText}>Atualizar</Text>
        </TouchableOpacity>
      </View>

      <View style={reportsStyles.tabBar}>
        {RELATORIO_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[reportsStyles.tabItem, isActive && reportsStyles.tabItemActive]}
              onPress={() => {
                setActiveTab(tab.key);
              }}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? '#1b5e20' : '#6c757d'}
                style={reportsStyles.tabIcon}
              />
              <Text style={[reportsStyles.tabLabel, isActive && reportsStyles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={reportsStyles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={reportsStyles.statsContainer}>
          {summaryCards.map((card) => (
            <View key={card.key} style={reportsStyles.statCard}>
              <View style={reportsStyles.statHeader}>
                <Ionicons name={card.icon} size={18} color="#1b5e20" />
                <Text style={reportsStyles.statLabel}>{card.label}</Text>
              </View>
              <Text style={reportsStyles.statValue}>{card.value}</Text>
              <Text style={reportsStyles.statDescription}>{card.description}</Text>
            </View>
          ))}
        </View>

        {renderFilters()}

        {activeTab === 'avaliacoes' ? renderEvaluationTable() : renderComplaintTable()}
      </ScrollView>
      {renderDetailModal()}
      {renderComplaintModal()}
    </View>
  );
};

const RelatoriosScreen: React.FC = () => (
  <ReportsProvider>
    <RelatoriosContent />
  </ReportsProvider>
);

export default RelatoriosScreen;
