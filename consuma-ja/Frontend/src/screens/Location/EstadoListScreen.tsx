import React, { useCallback, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import locationService from '../../services/locationService'

type Estado = {
  estado_id: number
  estado_nome: string
  estado_sigla: string
}

type EstadoListScreenProps = {
  navigation: any
}

const normalizeResponse = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[]
  }
  if (Array.isArray((payload as any)?.data)) {
    return (payload as { data: T[] }).data
  }
  return []
}

interface EstadoListItemProps {
  item: Estado
  onEdit: (estado: Estado) => void
  onDelete: (estado: Estado) => void
}

const EstadoListItem: React.FC<EstadoListItemProps> = ({ item, onEdit, onDelete }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemText}>
      <Text style={styles.itemText}>
        {item.estado_id} - {item.estado_nome} ({item.estado_sigla})
      </Text>
    </View>
    <View style={styles.listItemButtons}>
      <TouchableOpacity onPress={() => onEdit(item)} style={[styles.button, styles.editButton]}>
        <Text style={styles.buttonTextSmall}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item)} style={[styles.button, styles.deleteButton]}>
        <Text style={styles.buttonTextSmall}>Excluir</Text>
      </TouchableOpacity>
    </View>
  </View>
)

const EstadoListScreen: React.FC<EstadoListScreenProps> = ({ navigation }) => {
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEstados = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await locationService.getEstados()
      setEstados(normalizeResponse<Estado>(response))
    } catch (err) {
      console.error('[EstadoListScreen] Erro ao buscar estados', err)
      setError('Não foi possível carregar os estados.')
      setEstados([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchEstados()
    }, [fetchEstados]),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    fetchEstados()
  }

  const handleEdit = (estado: Estado) => {
    navigation.navigate('EstadoForm', { estadoParaEditar: estado })
  }

  const handleDelete = (estado: Estado) => {
    Alert.alert('Confirmar Exclusão', `Tem certeza que deseja excluir o estado "${estado.estado_nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true)
            await locationService.deleteEstado(estado.estado_id)
            Alert.alert('Sucesso', 'Estado excluído com sucesso!')
            fetchEstados()
          } catch (err: any) {
            console.error('[EstadoListScreen] Erro ao excluir estado', err)
            const message = err?.response?.data?.message || 'Não foi possível excluir o estado.'
            Alert.alert('Erro', message)
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const renderContent = () => {
    if (loading && !refreshing) {
      return <ActivityIndicator size="large" color="#0066cc" style={styles.centered} />
    }

    if (error) {
      return (
        <Text style={[styles.centered, styles.errorText]}>
          {error}
        </Text>
      )
    }

    if (!loading && estados.length === 0) {
      return <Text style={styles.centered}>Nenhum estado encontrado.</Text>
    }

    return (
      <FlatList
        data={estados}
        keyExtractor={(item) => `${item.estado_id}`}
        renderItem={({ item }) => <EstadoListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0066cc']} />}
      />
    )
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, styles.addButton]} onPress={() => navigation.navigate('EstadoForm')}>
        <Text style={styles.buttonText}>Adicionar Novo Estado</Text>
      </TouchableOpacity>
      {renderContent()}
      {loading && refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  list: { padding: 10 },
  listItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  listItemText: {
    flex: 1,
    marginRight: 10,
  },
  listItemButtons: {
    flexDirection: 'row',
  },
  itemText: { fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', textAlign: 'center' },
  errorText: { color: 'red', fontSize: 16 },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: { backgroundColor: '#ffc107' },
  deleteButton: { backgroundColor: '#dc3545' },
  addButton: { backgroundColor: '#28a745', margin: 10, padding: 15 },
  buttonText: { color: 'white', fontSize: 16 },
  buttonTextSmall: { color: 'white', fontSize: 12 },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
})

export default EstadoListScreen
