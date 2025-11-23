import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { orderApiClient } from '../../api/client';

const DeliverySimulationScreen = () => {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // ID do Fornecedor Fixo para teste (Nestlé que criamos no SQL)
  // Substitua pelo ID que o script SQL gerou!
  const ID_FORNECEDOR_TESTE = 1010; 

  useEffect(() => {
    const loadUser = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    loadUser();
  }, []);

  const handleSimular = async () => {
    if (!userId) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      // Chama o backend para calcular
      const response = await orderApiClient.post('/entregas/simulacao', {
        clienteId: parseInt(userId),
        fornecedorId: ID_FORNECEDOR_TESTE
      });
      
      setResultado(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível calcular a entrega.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons name="map" size={50} color="#2196f3" />
        <Text style={styles.title}>Simulador de Entrega</Text>
        <Text style={styles.subtitle}>Integração Uber Direct (Demo)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📦 Fornecedor:</Text>
        <Text style={styles.value}>Loja Nestlé Centro</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.label}>📍 Seu Endereço (Cliente):</Text>
        <Text style={styles.value}>{userId ? `Usuário Logado (ID: ${userId})` : 'Carregando...'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSimular} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Calcular Frete e Prazo</Text>
        )}
      </TouchableOpacity>

      {resultado && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Orçamento de Entrega</Text>
          
          <View style={styles.row}>
            <Ionicons name="navigate-circle-outline" size={20} color="#555" />
            <Text style={styles.routeText}>De: {resultado.origem}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#555" />
            <Text style={styles.routeText}>Para: {resultado.destino}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tempo</Text>
              <Text style={styles.statValue}>{resultado.tempo_estimado}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Distância</Text>
              <Text style={styles.statValue}>{resultado.distancia}</Text>
            </View>
            <View style={[styles.statBox, styles.costBox]}>
              <Text style={[styles.statLabel, {color: '#fff'}]}>Custo</Text>
              <Text style={[styles.statValue, {color: '#fff'}]}>{resultado.custo}</Text>
            </View>
          </View>
          
          <Text style={styles.disclaimer}>*Valores estimados pela API Uber Direct</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: '#f5f5f5' },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#666' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2, marginBottom: 20 },
  label: { fontSize: 14, color: '#888', marginBottom: 2 },
  value: { fontSize: 16, color: '#333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  button: { backgroundColor: '#000', padding: 15, borderRadius: 8, alignItems: 'center', elevation: 3 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  resultCard: { marginTop: 30, backgroundColor: '#fff', padding: 20, borderRadius: 10, elevation: 4, borderLeftWidth: 5, borderLeftColor: '#2196f3' },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  row: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  routeText: { marginLeft: 8, color: '#555', flex: 1, fontSize: 13 },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  statBox: { alignItems: 'center', flex: 1, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8, marginHorizontal: 2 },
  costBox: { backgroundColor: '#28a745' },
  statLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
  disclaimer: { fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 15, fontStyle: 'italic' }
});

export default DeliverySimulationScreen;