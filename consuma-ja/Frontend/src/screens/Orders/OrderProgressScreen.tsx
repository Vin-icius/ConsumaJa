import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { configStyles } from '../../common/styles/Core/configScreen.styled';
import promocaoService from '../../services/promocaoService';
import { useApplication } from '../../contexts/ApplicationContext/ApplicationContext';

const STAGES = ['Pedido recebido', 'Preparando', 'Enviado para transportadora', 'A caminho', 'Entregue'];

const OrderProgressScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useApplication();
  const vendaId = route.params?.vendaId;

  const [stageIndex, setStageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await promocaoService.getVendaStatus(vendaId);
        if (resp && typeof resp.stage === 'number') setStageIndex(resp.stage);
      } catch (err) {
        console.warn('Não foi possível carregar status da venda', err);
      }
    };
    load();
  }, [vendaId]);

  const handleAdvance = async () => {
    try {
      setLoading(true);
      const next = Math.min(stageIndex + 1, STAGES.length - 1);
      await promocaoService.updateVendaStage(vendaId, { stage: next });
      setStageIndex(next);

      if (next === STAGES.length - 1) {
        // notify user (backend should create notification)
        Alert.alert('Pedido entregue', 'Notificação enviada ao comprador.');
      }
    } catch (err: any) {
      Alert.alert('Erro', err?.message || 'Não foi possível avançar etapa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={configStyles.container}>
      <Text style={configStyles.sectionTitle}>Progresso do Pedido #{vendaId}</Text>
      <Text style={configStyles.sectionDescription}>Status atual: {STAGES[stageIndex]}</Text>

      <View style={{ marginVertical: 18 }}>
        {STAGES.map((s, idx) => (
          <View key={s} style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: idx === stageIndex ? '700' : '400' }}>{`${idx + 1}. ${s}`}</Text>
          </View>
        ))}
      </View>

      {user?.role === 'Fornecedor' && stageIndex < STAGES.length - 1 && (
        <TouchableOpacity style={[configStyles.button, configStyles.secondaryButton]} onPress={handleAdvance} disabled={loading}>
          {loading ? <ActivityIndicator color="#4CAF50" /> : <Text style={configStyles.secondaryButtonText}>Avançar etapa</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[configStyles.button, { marginTop: 12 }]} onPress={() => navigation.navigate('Inicio')}>
        <Text style={configStyles.buttonText}>Voltar ao início</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderProgressScreen;
