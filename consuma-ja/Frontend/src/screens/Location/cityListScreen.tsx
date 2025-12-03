import React, { useCallback, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker'
import locationService from '../../services/locationService'
import { cityListStyles } from '../../common/styles/Location/cityListScreen.styled'

type Cidade = {
  cidade_id: number
  cidade_nome: string
  regiao_ddd: string
  estado_id: number
}

type Estado = {
  estado_id: number
  estado_nome: string
  estado_sigla: string
}

type EstadoFilterValue = typeof DEFAULT_ESTADO_FILTER | number

const DEFAULT_ESTADO_FILTER = '' as const

const normalizeResponse = <T,>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[]
  }
  if (Array.isArray((payload as any)?.data)) {
    return (payload as { data: T[] }).data
  }
  return []
}

interface CidadeListItemProps {
  item: Cidade
  onEdit: (cidade: Cidade) => void
  onDelete: (cidade: Cidade) => void
}

const CidadeListItem: React.FC<CidadeListItemProps> = ({ item, onEdit, onDelete }) => (
  <View style={cityListStyles.listItem}>
    <View style={cityListStyles.listItemText}>
      <Text style={cityListStyles.itemText}>
        {item.cidade_id} - {item.cidade_nome}
      </Text>
      <Text style={cityListStyles.itemSubText}>
        DDD: {item.regiao_ddd} (Estado ID: {item.estado_id})
      </Text>
    </View>
    <View style={cityListStyles.listItemButtons}>
      <TouchableOpacity onPress={() => onEdit(item)} style={[cityListStyles.button, cityListStyles.editButton]}>
        <Text style={cityListStyles.buttonTextSmall}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item)} style={[cityListStyles.button, cityListStyles.deleteButton]}>
        <Text style={cityListStyles.buttonTextSmall}>Excluir</Text>
      </TouchableOpacity>
    </View>
  </View>
)

type CityListScreenProps = {
  navigation: any
}

const CityListScreen: React.FC<CityListScreenProps> = ({ navigation }) => {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [selectedEstadoId, setSelectedEstadoId] = useState<EstadoFilterValue>(DEFAULT_ESTADO_FILTER)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEstados = useCallback(async () => {
    try {
      const response = await locationService.getEstados()
      setEstados(normalizeResponse<Estado>(response))
    } catch (err) {
      console.error('[CityListScreen] Erro ao buscar estados', err)
    }
  }, [])

  const fetchCidades = useCallback(async (estadoFilter: EstadoFilterValue) => {
    setLoading(true)
    setError(null)
    try {
      const response =
        estadoFilter === DEFAULT_ESTADO_FILTER
          ? await locationService.getCidades()
          : await locationService.getCidadesByEstado(Number(estadoFilter))

      setCidades(normalizeResponse<Cidade>(response))
    } catch (err) {
      console.error('[CityListScreen] Erro ao buscar cidades', err)
      setError('Não foi possível carregar as cidades.')
      setCidades([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchEstados()
      fetchCidades(selectedEstadoId)
    }, [fetchEstados, fetchCidades, selectedEstadoId]),
  )

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCidades(selectedEstadoId)
  }

  const handleEdit = (cidade: Cidade) => {
    navigation.navigate('CidadeForm', { cidadeParaEditar: cidade })
  }

  const handleDelete = (cidade: Cidade) => {
    Alert.alert('Confirmar Exclusão', `Tem certeza que deseja excluir a cidade "${cidade.cidade_nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true)
            await locationService.deleteCidade(cidade.cidade_id)
            Alert.alert('Sucesso', 'Cidade excluída com sucesso!')
            fetchCidades(selectedEstadoId)
          } catch (err: any) {
            console.error('[CityListScreen] Erro ao excluir cidade', err)
            const message = err?.response?.data?.message || 'Não foi possível excluir a cidade.'
            Alert.alert('Erro', message)
          } finally {
            setLoading(false)
          }
        },
      },
    ])
  }

  const handleEstadoFilterChange = (value: string | number) => {
    if (value === DEFAULT_ESTADO_FILTER) {
      setSelectedEstadoId(DEFAULT_ESTADO_FILTER)
      fetchCidades(DEFAULT_ESTADO_FILTER)
      return
    }

    const numericValue = Number(value)
    setSelectedEstadoId(numericValue)
    fetchCidades(numericValue)
  }

  const renderContent = () => {
    if (loading && !refreshing) {
      return <ActivityIndicator size="large" color="#0066cc" style={cityListStyles.centered} />
    }

    if (error) {
      return (
        <Text style={[cityListStyles.centered, cityListStyles.errorText]}>
          {error}
        </Text>
      )
    }

    if (!loading && cidades.length === 0) {
      return <Text style={cityListStyles.centered}>Nenhuma cidade encontrada.</Text>
    }

    return (
      <FlatList
        data={cidades}
        keyExtractor={(item) => `${item.cidade_id}`}
        renderItem={({ item }) => <CidadeListItem item={item} onEdit={handleEdit} onDelete={handleDelete} />}
        contentContainerStyle={cityListStyles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#0066cc']} />}
      />
    )
  }

  return (
    <View style={cityListStyles.container}>
      <View style={cityListStyles.pickerContainer}>
        <Picker
          selectedValue={selectedEstadoId}
          onValueChange={handleEstadoFilterChange}
          style={cityListStyles.picker}
          prompt="Filtrar por Estado"
        >
          <Picker.Item label="Todos os Estados" value={DEFAULT_ESTADO_FILTER} />
          {estados.map((estado) => (
            <Picker.Item
              key={estado.estado_id}
              label={`${estado.estado_nome} (${estado.estado_sigla})`}
              value={estado.estado_id}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={[cityListStyles.button, cityListStyles.addButton]}
        onPress={() => navigation.navigate('CidadeForm')}
      >
        <Text style={cityListStyles.buttonText}>Adicionar Nova Cidade</Text>
      </TouchableOpacity>

      {renderContent()}

      {loading && refreshing && (
        <View style={cityListStyles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
    </View>
  )
}

export default CityListScreen
