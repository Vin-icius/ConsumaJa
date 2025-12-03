import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
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

const complaintBadgeTheme: Record<string, { backgroundColor: string; color: string }> = {
  DEFAULT: { backgroundColor: '#eef2f5', color: '#2b2b2b' },
  PENDENTE: { backgroundColor: '#fff8e1', color: '#8a6d1a' },
  ANALISE: { backgroundColor: '#e3f2fd', color: '#0d47a1' },
  APROVADA: { backgroundColor: '#e8f5e9', color: '#1b5e20' },
  REJEITADA: { backgroundColor: '#ffebee', color: '#b71c1c' },
}

const formatDisplayDate = (raw?: string | Date | null) => {
  if (!raw) {
    return null
  }
  const date = typeof raw === 'string' ? new Date(raw) : raw
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toLocaleDateString('pt-BR')
}

type StageValue = typeof stageFlow[number]

type Purchase = {
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
  fornecedor?: { nome?: string }
  itens?: Array<{
    produtoNome: string
    quantidade: number
    valorUnitario: number
    loteId?: number | null
  }>
  feedback?: {
    avaliacaoId?: number
    mediaNota?: number | null
    totalNotas?: number
    criadoEm?: string
  } | null
  reclamacao?: {
    id: number
    status: string
    motivo: string
    criadoEm: string
    itens: { loteId: number; quantidade: number }[]
  } | null
}

type ComplaintItemForm = {
  loteId: number
  produtoNome: string
  quantidadeComprada: number
  quantidadeSelecionada: string
}

const MinhasComprasScreen: React.FC = () => {
  const { user } = useApplication()
  const pessoaId = user?.pessoa_id
  const userTipo = user?.pessoa_tipo
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const listRef = useRef<FlatList<any>>(null)
  const [orders, setOrders] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [complaintModalVisible, setComplaintModalVisible] = useState(false)
  const [complaintReason, setComplaintReason] = useState('')
  const [complaintItems, setComplaintItems] = useState<ComplaintItemForm[]>([])
  const [complaintTarget, setComplaintTarget] = useState<Purchase | null>(null)
  const [complaintSubmitting, setComplaintSubmitting] = useState(false)
  const focusVendaId = route.params?.focusVendaId

  const canAccess = userTipo === 'Fisica' || userTipo === 'Admin'

  const fetchOrders = useCallback(async () => {
    if (!pessoaId) {
      return
    }
    setLoading(true)
    try {
      const response = await orderService.getClientSales(pessoaId, { limit: 50 })
      const data = Array.isArray(response?.data) ? response.data : response || []
      setOrders(data as Purchase[])
    } catch (error) {
      console.error('[MinhasCompras] Erro ao carregar compras', error)
    } finally {
      setLoading(false)
    }
  }, [pessoaId])

  useEffect(() => {
    if (canAccess) {
      fetchOrders()
    }
  }, [fetchOrders, canAccess])

  useEffect(() => {
    if (focusVendaId && orders.length) {
      const index = orders.findIndex((sale) => sale.vendaId === focusVendaId)
      if (index >= 0) {
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index, animated: true })
          navigation.setParams({ focusVendaId: null })
        }, 300)
      }
    }
  }, [focusVendaId, orders, navigation])

  const onRefresh = useCallback(async () => {
    if (!pessoaId) {
      return
    }
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }, [fetchOrders, pessoaId])

  const closeComplaintModal = () => {
    setComplaintModalVisible(false)
    setComplaintReason('')
    setComplaintItems([])
    setComplaintTarget(null)
  }

  const openComplaintModal = (order: Purchase) => {
    const normalizedItems: ComplaintItemForm[] = (order.itens || [])
      .map((produto) => ({
        loteId: Number(produto.loteId),
        produtoNome: produto.produtoNome,
        quantidadeComprada: Number(produto.quantidade || 0),
        quantidadeSelecionada: String(produto.quantidade || 0),
      }))
      .filter((item) => Number.isFinite(item.loteId) && item.loteId > 0 && item.quantidadeComprada > 0)

    if (!normalizedItems.length) {
      Alert.alert('Itens indisponíveis', 'Não foi possível carregar os itens deste pedido para a reclamação.')
      return
    }

    setComplaintReason('')
    setComplaintItems(normalizedItems)
    setComplaintTarget(order)
    setComplaintModalVisible(true)
  }

  const handleComplaintQuantityChange = (loteId: number, value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '')
    setComplaintItems((prev) =>
      prev.map((item) => (item.loteId === loteId ? { ...item, quantidadeSelecionada: sanitized } : item)),
    )
  }

  const handleSubmitComplaint = async () => {
    if (!complaintTarget) {
      return
    }

    const motivo = complaintReason.trim()
    if (!motivo) {
      Alert.alert('Informe o motivo', 'Descreva rapidamente o problema antes de enviar.')
      return
    }

    const itensPayload = complaintItems
      .map((item) => ({
        loteId: item.loteId,
        quantidade: Number(item.quantidadeSelecionada || '0'),
        maxPermitido: item.quantidadeComprada,
      }))
      .filter((item) => Number.isFinite(item.quantidade) && item.quantidade > 0)

    if (!itensPayload.length) {
      Alert.alert('Selecione os itens', 'Informe ao menos um item com quantidade para registrar a reclamação.')
      return
    }

    const excedente = itensPayload.find((item) => item.quantidade > item.maxPermitido)
    if (excedente) {
      Alert.alert('Quantidade inválida', 'A quantidade reclamada não pode ser maior que a quantidade adquirida.')
      return
    }

    try {
      setComplaintSubmitting(true)
      await orderService.createComplaint(complaintTarget.vendaId, {
        motivo,
        itens: itensPayload.map(({ loteId, quantidade }) => ({ loteId, quantidade })),
        pessoaId: user?.pessoa_id ?? null,
        actorId: user?.pessoa_id ?? null,
        actorTipo: user?.pessoa_tipo ?? null,
      })
      Alert.alert('Reclamação enviada', 'Sua solicitação foi registrada e será analisada pelo fornecedor.')
      closeComplaintModal()
      await fetchOrders()
    } catch (error: any) {
      Alert.alert('Erro ao enviar', error?.response?.data?.message || 'Não foi possível registrar a reclamação.')
    } finally {
      setComplaintSubmitting(false)
    }
  }

  const handleNavigateToFeedback = (vendaId: number) => {
    navigation.navigate('AvaliacaoQuestionario', { pedidoId: vendaId })
  }

  const renderOrder = ({ item }: { item: Purchase }) => {
    const progress = item.progresso
      ? ((item.progresso.indice + 1) / Math.max(1, item.progresso.totalEtapas)) * 100
      : 0

    const entregaTexto = item.retiradaNoFornecedor
      ? 'Retirar no fornecedor'
      : item.endereco
        ? `${item.endereco.rua ?? ''}, ${item.endereco.numero ?? ''} - ${item.endereco.bairro ?? ''}\n${item.endereco.cidade ?? ''}/${item.endereco.estado ?? ''} • CEP ${item.endereco.cep ?? ''}`
        : 'Endereço não informado'

    const canEvaluate = item.etapa === 'PRODUTOS_ENTREGUES' && !item.feedback
    const complaintStatus = item.reclamacao?.status ?? null
    const canComplain = item.etapa === 'PRODUTOS_ENTREGUES' && (!item.reclamacao || complaintStatus === 'REJEITADA')
    const complaintTheme = complaintBadgeTheme[complaintStatus ?? 'DEFAULT'] ?? complaintBadgeTheme.DEFAULT
    const complaintLabel = complaintStatus ? complaintStatusLabels[complaintStatus] || complaintStatus : null
    const feedbackDate = formatDisplayDate(item.feedback?.criadoEm)

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.saleId}>Pedido #{item.vendaId}</Text>
            <Text style={styles.supplierName}>{item.fornecedor?.nome ?? 'Fornecedor não informado'}</Text>
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
          <Ionicons name="time-outline" size={16} color="#2F4F4F" />
          <Text style={styles.infoText}>Status: {item.status}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#2F4F4F" />
          <Text style={styles.infoText}>{entregaTexto}</Text>
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

        {(item.feedback || item.reclamacao) && (
          <View style={styles.badgesWrapper}>
            {item.feedback && (
              <View style={[styles.statusBadge, styles.feedbackBadge]}>
                <Ionicons name="star" size={14} color="#ffb300" style={styles.badgeIcon} />
                <Text style={styles.badgeText}>
                  Feedback enviado
                  {item.feedback.mediaNota ? ` • nota ${Number(item.feedback.mediaNota).toFixed(1)}` : ''}
                  {feedbackDate ? ` em ${feedbackDate}` : ''}
                </Text>
              </View>
            )}

            {item.reclamacao && complaintLabel && (
              <View style={[styles.statusBadge, { backgroundColor: complaintTheme.backgroundColor }]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={14}
                  color={complaintTheme.color}
                  style={styles.badgeIcon}
                />
                <Text style={[styles.badgeText, { color: complaintTheme.color }]}>
                  Reclamação: {complaintLabel}
                </Text>
              </View>
            )}
          </View>
        )}

        {(canEvaluate || canComplain) && (
          <View style={styles.actionsRow}>
            {canEvaluate && (
              <TouchableOpacity
                style={[styles.actionButton, styles.feedbackButton]}
                onPress={() => handleNavigateToFeedback(item.vendaId)}
              >
                <Ionicons name="chatbox-ellipses-outline" size={16} color="#1b5e20" style={styles.badgeIcon} />
                <Text style={[styles.actionButtonText, { color: '#1b5e20' }]}>Avaliar compra</Text>
              </TouchableOpacity>
            )}

            {canComplain && (
              <TouchableOpacity style={[styles.actionButton, styles.complaintButton]} onPress={() => openComplaintModal(item)}>
                <Ionicons name="alert" size={16} color="#b71c1c" style={styles.badgeIcon} />
                <Text style={[styles.actionButtonText, { color: '#b71c1c' }]}>Realizar reclamação</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    )
  }

  if (!canAccess) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="lock-closed-outline" size={42} color="#9e9e9e" />
        <Text style={styles.emptyTitle}>Acesso restrito</Text>
        <Text style={styles.emptyDescription}>Apenas clientes podem visualizar suas compras.</Text>
      </View>
    )
  }

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color="#2F4F4F" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={orders}
        keyExtractor={(item) => item.vendaId.toString()}
        renderItem={renderOrder}
        contentContainerStyle={orders.length === 0 ? styles.emptyListContainer : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={42} color="#9e9e9e" />
              <Text style={styles.emptyTitle}>Nenhuma compra encontrada</Text>
              <Text style={styles.emptyDescription}>Finalize um pedido para acompanhar seu status aqui.</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={complaintModalVisible} animationType="slide" transparent onRequestClose={closeComplaintModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Reclamar pedido #{complaintTarget?.vendaId ?? ''}
            </Text>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <Text style={styles.modalLabel}>Descreva o problema</Text>
              <TextInput
                style={styles.modalTextarea}
                multiline
                numberOfLines={4}
                placeholder="Explique rapidamente o que ocorreu..."
                value={complaintReason}
                onChangeText={setComplaintReason}
                placeholderTextColor="#8d8d8d"
              />

              <Text style={[styles.modalLabel, { marginTop: 16 }]}>Itens envolvidos</Text>
              {complaintItems.length === 0 ? (
                <Text style={styles.modalEmptyText}>Nenhum item disponível.</Text>
              ) : (
                complaintItems.map((produto) => (
                  <View key={produto.loteId} style={styles.modalItemRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={styles.modalItemName}>{produto.produtoNome}</Text>
                      <Text style={styles.modalItemInfo}>Comprados: {produto.quantidadeComprada}</Text>
                    </View>
                    <TextInput
                      style={styles.modalQuantityInput}
                      keyboardType="numeric"
                      value={produto.quantidadeSelecionada}
                      onChangeText={(value) => handleComplaintQuantityChange(produto.loteId, value)}
                      placeholder="0"
                    />
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={closeComplaintModal}
                disabled={complaintSubmitting}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleSubmitComplaint}
                disabled={complaintSubmitting}
              >
                {complaintSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>Enviar reclamação</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  supplierName: {
    fontSize: 16,
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
  badgesWrapper: {
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#eef2f5',
    marginTop: 6,
  },
  feedbackBadge: {
    backgroundColor: '#fff8e1',
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    color: '#2b2b2b',
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 10,
    marginTop: 8,
    backgroundColor: '#f7f9fa',
    borderWidth: 1,
    borderColor: '#e3e7ec',
  },
  feedbackButton: {
    backgroundColor: '#f1fff2',
    borderColor: '#c8e6c9',
  },
  complaintButton: {
    backgroundColor: '#fff4f5',
    borderColor: '#ffcdd2',
  },
  actionButtonText: {
    fontWeight: '600',
    color: '#2b2b2b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1d',
    marginBottom: 12,
  },
  modalScrollContent: {
    paddingBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b3b3b',
    marginBottom: 6,
  },
  modalTextarea: {
    borderWidth: 1,
    borderColor: '#dfe3eb',
    borderRadius: 12,
    minHeight: 90,
    padding: 12,
    textAlignVertical: 'top',
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f1f1f',
  },
  modalItemInfo: {
    fontSize: 12,
    color: '#6b6b6b',
    marginTop: 2,
  },
  modalQuantityInput: {
    width: 70,
    borderWidth: 1,
    borderColor: '#dfe3eb',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  modalEmptyText: {
    color: '#6b6b6b',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelButton: {
    borderWidth: 1,
    borderColor: '#cbd0d6',
    marginRight: 10,
  },
  modalSubmitButton: {
    backgroundColor: '#1b5e20',
  },
  modalCancelText: {
    color: '#3d3d3d',
    fontWeight: '600',
  },
  modalSubmitText: {
    color: '#fff',
    fontWeight: '600',
  },
})

export default MinhasComprasScreen
