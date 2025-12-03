import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Platform } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useApplication } from '../../contexts/ApplicationContext/ApplicationContext'
import orderService from '../../services/orderService'

const stageFlow = ['SEPARANDO_PRODUTOS', 'LOGISTICA_TRANSPORTADORA', 'PRODUTOS_A_CAMINHO', 'PRODUTOS_ENTREGUES'] as const
const stageLabels: Record<string, string> = {
  SEPARANDO_PRODUTOS: 'Separando produtos',
  LOGISTICA_TRANSPORTADORA: 'Logística da transportadora',
  PRODUTOS_A_CAMINHO: 'Produtos a caminho',
  PRODUTOS_ENTREGUES: 'Produtos entregues',
}

const complaintStatusLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  ANALISE: 'Em análise',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
}

const complaintStatusThemes: Record<string, { backgroundColor: string; color: string }> = {
  PENDENTE: { backgroundColor: '#fff3cd', color: '#8a6d1a' },
  ANALISE: { backgroundColor: '#e0f2ff', color: '#0d47a1' },
  APROVADA: { backgroundColor: '#d1e7dd', color: '#0f5132' },
  REJEITADA: { backgroundColor: '#fdecea', color: '#842029' },
}

type StageValue = typeof stageFlow[number]

type SaleSummary = {
  vendaId: number
  status: string
  etapa: StageValue
  progresso?: { indice: number; totalEtapas: number }
  total: number
  data: string
  pagamento?: { metodo?: string | null; parcelas?: number | null }
  retiradaNoFornecedor?: boolean
  endereco?: {
    rua?: string | null
    numero?: string | null
    bairro?: string | null
    cidade?: string | null
    estado?: string | null
    cep?: string | null
  } | null
  cliente?: {
    nome?: string
    cpf?: string | null
    email?: string
  }
  itens?: Array<{
    produtoNome: string
    quantidade: number
    valorUnitario: number
  }>
  reclamacao?: {
    id: number
    status: string
    motivo: string
    criadoEm?: string
    itens?: Array<{
      loteId: number
      quantidade: number
      produtoNome?: string | null
    }>
  } | null
}

const HistoricoVendasScreen: React.FC = () => {
  const { user } = useApplication()
  const pessoaId = user?.pessoa_id
  const userTipo = user?.pessoa_tipo
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const listRef = useRef<FlatList<any>>(null)
  const [sales, setSales] = useState<SaleSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [advancingId, setAdvancingId] = useState<number | null>(null)
  const [complaintActionId, setComplaintActionId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const focusVendaId = route.params?.focusVendaId

  const canAccess = userTipo === 'Juridica' || userTipo === 'Admin'
  const canModerateComplaints = canAccess

  const fetchSales = useCallback(async () => {
    if (!pessoaId) {
      return
    }

    setLoading(true)
    try {
      const response = await orderService.getSupplierSales(pessoaId, { limit: 50 })
      const data = Array.isArray(response?.data) ? response.data : response || []
      setSales(data as SaleSummary[])
      setErrorMessage(null)
    } catch (error: any) {
      console.error('[HistoricoVendas] Erro ao carregar vendas', error)
      const message = error?.response?.data?.message || error?.message || 'Não foi possível carregar as vendas.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }, [pessoaId])

  useEffect(() => {
    if (canAccess) {
      fetchSales()
    }
  }, [fetchSales, canAccess])

  useEffect(() => {
    if (focusVendaId && sales.length) {
      const index = sales.findIndex((sale) => sale.vendaId === focusVendaId)
      if (index >= 0) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index, animated: true })
          navigation.setParams({ focusVendaId: null })
        }, 350)
      }
    }
  }, [focusVendaId, sales, navigation])

  const onRefresh = useCallback(async () => {
    if (!pessoaId) {
      return
    }
    setRefreshing(true)
    await fetchSales()
    setRefreshing(false)
  }, [fetchSales, pessoaId])

  const getNextStage = useCallback((currentStage: StageValue) => {
    const index = stageFlow.indexOf(currentStage)
    if (index === -1 || index === stageFlow.length - 1) {
      return null
    }
    return stageFlow[index + 1]
  }, [])

  const handleAdvanceStage = useCallback(
    async (sale: SaleSummary) => {
      const nextStage = getNextStage(sale.etapa)
      if (!nextStage) {
        return
      }

      try {
        setAdvancingId(sale.vendaId)
        const updated = await orderService.advanceSaleStage(sale.vendaId, {
          stage: nextStage,
          actorId: user?.pessoa_id,
        })
        setSales((prev) => prev.map((item) => (item.vendaId === sale.vendaId ? (updated as SaleSummary) : item)))
      } catch (error: any) {
        console.error('[HistoricoVendas] Falha ao avançar etapa', error)
        const message = error?.response?.data?.message || error?.message || 'Não foi possível avançar a etapa.'
        Alert.alert('Erro', message)
      } finally {
        setAdvancingId(null)
      }
    },
    [getNextStage, user?.pessoa_id],
  )

  const handleComplaintStatusChange = useCallback(
    async (complaintId: number, status: 'APROVADA' | 'REJEITADA', vendaId?: number) => {
      try {
        setComplaintActionId(complaintId)
        await orderService.updateComplaintStatus(complaintId, {
          status,
          actorId: user?.pessoa_id,
          actorTipo: user?.pessoa_tipo,
        })
        await fetchSales()
        const pedidoReferencia = vendaId ? ` do pedido #${vendaId}` : ''
        Alert.alert(
          'Reclamação atualizada',
          `A reclamação${pedidoReferencia} foi ${status === 'APROVADA' ? 'aprovada' : 'rejeitada'}.`,
        )
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Não foi possível atualizar a reclamação.'
        Alert.alert('Erro', message)
      } finally {
        setComplaintActionId(null)
      }
    },
    [fetchSales, user?.pessoa_id, user?.pessoa_tipo],
  )

  const confirmComplaintStatusChange = useCallback(
    (complaintId: number, vendaId: number, status: 'APROVADA' | 'REJEITADA') => {
      const actionLabel = status === 'APROVADA' ? 'aprovar' : 'rejeitar'
      const execute = () => handleComplaintStatusChange(complaintId, status, vendaId)
      if (Platform.OS === 'web') {
        const confirmed = typeof window !== 'undefined' ? window.confirm(`Deseja ${actionLabel} a reclamação do pedido #${vendaId}?`) : true
        if (confirmed) {
          execute()
        }
        return
      }
      Alert.alert(
        `Confirmar ${actionLabel}`,
        `Deseja ${actionLabel} a reclamação do pedido #${vendaId}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: execute },
        ],
      )
    },
    [handleComplaintStatusChange],
  )

  const renderSale = ({ item }: { item: SaleSummary }) => {
    const progress = item.progresso
      ? ((item.progresso.indice + 1) / Math.max(1, item.progresso.totalEtapas)) * 100
      : 0
    const nextStage = getNextStage(item.etapa)
    const enderecoTexto = item.retiradaNoFornecedor
      ? 'Retirada no fornecedor'
      : item.endereco
        ? `${item.endereco.rua ?? ''}, ${item.endereco.numero ?? ''} - ${item.endereco.bairro ?? ''} \n${item.endereco.cidade ?? ''}/${item.endereco.estado ?? ''} • CEP ${item.endereco.cep ?? ''}`
        : 'Endereço não informado'

    const renderComplaintSection = () => {
      if (!item.reclamacao) {
        return null
      }
      const statusTheme = complaintStatusThemes[item.reclamacao.status] || complaintStatusThemes.PENDENTE
      const isActionable = canModerateComplaints && ['PENDENTE', 'ANALISE'].includes(item.reclamacao.status)
      return (
        <View style={styles.complaintCard}>
          <View style={styles.complaintHeader}>
            <Text style={styles.complaintTitle}>Reclamação #{item.reclamacao.id}</Text>
            <View style={[styles.complaintBadge, { backgroundColor: statusTheme.backgroundColor }]}>
              <Text style={[styles.complaintBadgeText, { color: statusTheme.color }]}>
                {complaintStatusLabels[item.reclamacao.status] || item.reclamacao.status}
              </Text>
            </View>
          </View>
          <Text style={styles.complaintReason}>{item.reclamacao.motivo}</Text>
          {item.reclamacao.itens?.length ? (
            <View style={styles.complaintItems}>
              {item.reclamacao.itens.map((complaintItem) => (
                <Text key={`${item.reclamacao?.id}-${complaintItem.loteId}`} style={styles.complaintItemText}>
                  {complaintItem.quantidade}x • Lote {complaintItem.loteId}
                </Text>
              ))}
            </View>
          ) : null}
          {isActionable ? (
            <View style={styles.complaintActions}>
              <TouchableOpacity
                style={[styles.complaintButton, styles.complaintButtonApprove]}
                onPress={() => confirmComplaintStatusChange(item.reclamacao!.id, item.vendaId, 'APROVADA')}
                disabled={complaintActionId === item.reclamacao.id}
              >
                {complaintActionId === item.reclamacao.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.complaintButtonText}>Aprovar</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.complaintButton, styles.complaintButtonReject]}
                onPress={() => confirmComplaintStatusChange(item.reclamacao!.id, item.vendaId, 'REJEITADA')}
                disabled={complaintActionId === item.reclamacao.id}
              >
                {complaintActionId === item.reclamacao.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.complaintButtonText}>Rejeitar</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.saleId}>Pedido #{item.vendaId}</Text>
            <Text style={styles.customerName}>{item.cliente?.nome}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {Number(item.total || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, progress)}%` }]} />
          </View>
          <Text style={styles.stageText}>{stageLabels[item.etapa]}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#2F4F4F" />
          <Text style={styles.infoText}>{item.cliente?.cpf ? `CPF: ${item.cliente.cpf}` : 'CPF não informado'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#2F4F4F" />
          <Text style={styles.infoText}>{enderecoTexto}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={16} color="#2F4F4F" />
          <Text style={styles.infoText}>
            {item.pagamento?.metodo ? `Pagamento: ${item.pagamento.metodo}` : 'Pagamento não informado'}
            {item.pagamento?.parcelas && item.pagamento.parcelas > 1 ? ` • ${item.pagamento.parcelas}x` : ''}
          </Text>
        </View>

        <View style={styles.itemsContainer}>
          {item.itens?.map((produto, index) => (
            <View key={`${item.vendaId}-${index}`} style={styles.itemRow}>
              <Text style={styles.itemName}>{produto.produtoNome}</Text>
              <Text style={styles.itemPrice}>
                {produto.quantidade}x R$ {Number(produto.valorUnitario).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {renderComplaintSection()}

        <View style={styles.actionsRow}>
          <View>
            <Text style={styles.nextStageLabel}>Próxima etapa</Text>
            <Text style={styles.nextStageValue}>{nextStage ? stageLabels[nextStage] : 'Pedido finalizado'}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.advanceButton,
              (!nextStage || advancingId === item.vendaId) && styles.advanceButtonDisabled,
            ]}
            onPress={() => handleAdvanceStage(item)}
            disabled={!nextStage || advancingId === item.vendaId}
          >
            {advancingId === item.vendaId ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.advanceButtonText}>{nextStage ? 'Avançar etapa' : 'Concluído'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!canAccess) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="lock-closed-outline" size={42} color="#9e9e9e" />
        <Text style={styles.emptyTitle}>Acesso restrito</Text>
        <Text style={styles.emptyDescription}>Esta tela está disponível apenas para fornecedores.</Text>
      </View>
    )
  }

  if (loading && sales.length === 0) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#2F4F4F" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={fetchSales}>
            <Text style={styles.errorRetry}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        ref={listRef}
        data={sales}
        keyExtractor={(item) => item.vendaId.toString()}
        renderItem={renderSale}
        contentContainerStyle={sales.length === 0 ? styles.emptyListContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={42} color="#9e9e9e" />
              <Text style={styles.emptyTitle}>Nenhum pedido registrado</Text>
              <Text style={styles.emptyDescription}>Assim que seus clientes realizarem compras você verá tudo aqui.</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fa',
    padding: 16,
  },
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  saleId: {
    fontSize: 14,
    color: '#6d6d6d',
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
    marginTop: 2,
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#9c9c9c',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1b5e20',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e1e7ea',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4caf50',
  },
  stageText: {
    marginTop: 6,
    fontSize: 13,
    color: '#2b2b2b',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  infoText: {
    marginLeft: 6,
    color: '#3f3f3f',
    flex: 1,
    flexWrap: 'wrap',
  },
  itemsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#f0f0f0',
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    color: '#2d2d2d',
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontWeight: '600',
    color: '#2d2d2d',
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#fefefe',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  complaintBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  complaintBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  complaintReason: {
    marginTop: 8,
    color: '#374151',
  },
  complaintItems: {
    marginTop: 8,
  },
  complaintItemText: {
    fontSize: 12,
    color: '#4b5563',
  },
  complaintActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  complaintButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  complaintButtonApprove: {
    backgroundColor: '#1b5e20',
  },
  complaintButtonReject: {
    backgroundColor: '#b42318',
  },
  complaintButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  nextStageLabel: {
    fontSize: 12,
    color: '#8c8c8c',
  },
  nextStageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1d',
    marginTop: 4,
  },
  advanceButton: {
    backgroundColor: '#1b5e20',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  advanceButtonDisabled: {
    backgroundColor: '#9cb09d',
  },
  advanceButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b6b6b',
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 60,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  errorBanner: {
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffeeba',
    marginBottom: 12,
  },
  errorText: {
    color: '#856404',
  },
  errorRetry: {
    marginTop: 6,
    color: '#2f4f4f',
    fontWeight: '600',
  },
})

export default HistoricoVendasScreen
