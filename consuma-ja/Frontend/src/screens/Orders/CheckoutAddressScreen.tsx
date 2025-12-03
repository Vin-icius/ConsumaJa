import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { configStyles } from '../../common/styles/Core/configScreen.styled';
import locationService from '../../services/locationService';
import { useApplication } from '../../contexts/ApplicationContext/ApplicationContext';

const CheckoutAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useApplication();
  const saleData = route.params?.saleData;

  const [enderecos, setEnderecos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEnderecoId, setSelectedEnderecoId] = useState<number | null>(saleData?.endereco_id ?? null);
  const [isPickup, setIsPickup] = useState(false);

  const [novoEndereco, setNovoEndereco] = useState({ rua: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '' });
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const pessoaId = user?.pessoa_id;
        const resp = await locationService.getEnderecos({ pessoaId, ativo: 'true', limit: 5 });
        setEnderecos(Array.isArray(resp) ? resp : []);
      } catch (err) {
        console.error('Erro ao carregar endereços', err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleAddEndereco = async () => {
    if (enderecos.length >= 5) {
      Alert.alert('Limite atingido', 'Você já possui 5 endereços cadastrados.');
      return;
    }

    // Basic validation
    if (!novoEndereco.rua || !novoEndereco.numero || !novoEndereco.bairro || !novoEndereco.cidade) {
      Alert.alert('Dados incompletos', 'Preencha rua, número, bairro e cidade.');
      return;
    }

    try {
      setLoading(true);
      const pessoaId = user?.pessoa_id;
      const payload = { ...novoEndereco, pessoa_id: pessoaId };
      const created = await locationService.createEndereco(payload);
      if (created && created.endereco_id) {
        setEnderecos((prev) => [created, ...prev]);
        setNovoEndereco({ rua: '', numero: '', complemento: '', bairro: '', cidade: '', cep: '' });
        setShowNewAddressForm(false);
        setSelectedEnderecoId(created.endereco_id);
        Alert.alert('Endereço salvo', 'Endereço cadastrado com sucesso.');
      }
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Não foi possível cadastrar o endereço.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!isPickup && !selectedEnderecoId) {
      Alert.alert('Selecione o endereço', 'Escolha um endereço de entrega ou marque retirada no fornecedor.');
      return;
    }

    // If pickup is selected, clear endereco_id
    const payloadEndereco = isPickup ? null : selectedEnderecoId;
    navigation.navigate('CheckoutPayment', { saleData: { ...saleData, endereco_id: payloadEndereco, isPickup } });
  };
  const isMobile = width < 768;

  return (
    <ScrollView contentContainerStyle={[configStyles.container, { padding: isMobile ? 12 : 20 }]} keyboardShouldPersistTaps="handled">
      <Text style={configStyles.sectionTitle}>Confirme o Endereço</Text>
      <Text style={configStyles.sectionDescription}>Escolha um endereço existente ou cadastre um novo. Alternativamente, selecione retirar no fornecedor.</Text>

      <TouchableOpacity
        style={[
          configStyles.secondaryButton,
          { marginBottom: 12, backgroundColor: isPickup ? '#e8f5e9' : undefined },
        ]}
        onPress={() => { setIsPickup(!isPickup); if (!isPickup) setSelectedEnderecoId(null); }}
      >
        <Text style={configStyles.secondaryButtonText}>{isPickup ? 'Retirada selecionada' : 'Retirar no fornecedor'}</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color="#4CAF50" />
      ) : (
        <FlatList
          data={enderecos}
          keyExtractor={(item) => String(item.endereco_id)}
          renderItem={({ item }) => {
            const selected = selectedEnderecoId === item.endereco_id && !isPickup;
            const cidadeLabel = typeof item.cidade === 'string'
              ? item.cidade
              : item.cidade?.nome || item.cidade?.descricao || item.cidade?.cidade || '';
            return (
              <TouchableOpacity
                style={[
                  configStyles.paymentCard,
                  selected && { borderColor: '#4CAF50', backgroundColor: '#f3fbf5' },
                ]}
                onPress={() => { setSelectedEnderecoId(item.endereco_id); setIsPickup(false); }}
                activeOpacity={0.8}
              >
                <Text style={configStyles.paymentCardTitle}>{`${item.rua}, ${item.numero}`}</Text>
                <Text style={configStyles.paymentCardDetail}>{`${item.bairro}${cidadeLabel ? ` — ${cidadeLabel}` : ''}`}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={{ marginTop: 16 }}>
        {!showNewAddressForm ? (
          <TouchableOpacity style={[configStyles.addPaymentButton, { paddingVertical: 12 }]} onPress={() => setShowNewAddressForm(true)}>
            <Text style={configStyles.addPaymentText}>Adicionar novo endereço</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={configStyles.label}>Novo Endereço</Text>
            <TextInput style={configStyles.input} placeholder="Rua" value={novoEndereco.rua} onChangeText={(t) => setNovoEndereco((s) => ({ ...s, rua: t }))} />
            <TextInput style={[configStyles.input, { marginTop: 8 }]} placeholder="Número" value={novoEndereco.numero} onChangeText={(t) => setNovoEndereco((s) => ({ ...s, numero: t }))} />
            <TextInput style={[configStyles.input, { marginTop: 8 }]} placeholder="Bairro" value={novoEndereco.bairro} onChangeText={(t) => setNovoEndereco((s) => ({ ...s, bairro: t }))} />
            <TextInput style={[configStyles.input, { marginTop: 8 }]} placeholder="Cidade" value={novoEndereco.cidade} onChangeText={(t) => setNovoEndereco((s) => ({ ...s, cidade: t }))} />
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <TouchableOpacity style={[configStyles.button, configStyles.saveButton]} onPress={handleAddEndereco}>
                <Text style={configStyles.buttonText}>Salvar Endereço</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[configStyles.button, { marginLeft: 8 }]} onPress={() => setShowNewAddressForm(false)}>
                <Text style={configStyles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={[configStyles.button, configStyles.saveButton, { marginTop: 14 }]} onPress={handleNext}>
        <Text style={configStyles.buttonText}>Próximo: Pagamento</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutAddressScreen;
