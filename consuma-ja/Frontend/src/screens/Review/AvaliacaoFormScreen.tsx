import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import avaliacaoService, { Pergunta } from '../../services/avaliacaoService'; // O serviço mantém o nome
import { avaliacaoQuestionarioStyles as styles } from '../../common/styles/Review/avaliacaoFormScreen.styled'; // <-- Caminho do estilo atualizado
import { RootStackParamList } from '../../navigation/appNavigator'; 
import { useApplication } from '../../contexts/ApplicationContext/ApplicationContext';

// --- TIPOS ---
interface RespostasState {
  [key: number]: number;
}
interface EstrelasProps {
  rating: number;
  setRating: (rating: number) => void;
  size?: number;
}
type AvaliacaoScreenRouteProp = RouteProp<RootStackParamList, 'AvaliacaoQuestionario'>;

// --- COMPONENTE INTERNO DE ESTRELAS ---
const Estrelas: React.FC<EstrelasProps> = ({ rating, setRating, size = 35 }) => (
    <View style={styles.estrelasContainer}>
        {[1, 2, 3, 4, 5].map((estrela) => (
            <TouchableOpacity key={estrela} onPress={() => setRating(estrela)}>
                <Ionicons name={rating >= estrela ? 'star' : 'star-outline'} size={size} color="#FFD700" />
            </TouchableOpacity>
        ))}
    </View>
);

// --- COMPONENTE PRINCIPAL DA TELA ---
const AvaliacaoQuestionarioScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AvaliacaoScreenRouteProp>();
  const { pedidoId } = route.params;
  const { user } = useApplication();

  // --- ESTADOS ---
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<RespostasState>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [comentario, setComentario] = useState('');
  const submitLockRef = useRef(false);

  // --- LÓGICA DE BUSCA ---
  const fetchPerguntas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await avaliacaoService.listarPerguntasAtivas();
      setPerguntas(data);
    } catch (err) {
      setError("Não foi possível carregar o formulário de avaliação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerguntas();
  }, [fetchPerguntas]);

  // --- MANIPULADORES DE EVENTOS ---
  const handleSetResposta = (perguntaId: number, nota: number) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: nota }));
  };

  const handleComentarioChange = (value: string) => {
    setComentario(value.slice(0, 500));
  };

  const handleSubmit = async () => {
    if (submitLockRef.current || submitLoading) {
      return;
    }
    if (Object.keys(respostas).length !== perguntas.length) {
      Alert.alert("Atenção", "Por favor, responda a todas as perguntas para continuar.");
      return;
    }
    submitLockRef.current = true;
    setSubmitLoading(true);
    const respostasPayload = Object.entries(respostas).map(([pergunta_id, nota]) => ({
      pergunta_id: Number(pergunta_id),
      nota,
    }));
    try {
      await avaliacaoService.enviarRespostas({
        venda_id: pedidoId,
        respostas: respostasPayload,
        descricao: comentario.trim() ? comentario.trim() : undefined,
        pessoa_id: user?.pessoa_id ?? undefined,
      });
      Alert.alert("Obrigado!", "Sua avaliação foi registrada com sucesso.");
      navigation.navigate('MinhasCompras' as never);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ocorreu um erro ao enviar sua avaliação.";
      Alert.alert("Erro", msg);
    } finally {
      submitLockRef.current = false;
      setSubmitLoading(false);
    }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#28a745" /></View>;
  }
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPerguntas}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}><Text style={styles.headerTitle}>Avaliação de Compra</Text></View>
        <View style={styles.formContent}>
          {perguntas.map((pergunta) => (
            <View key={pergunta.perguntas_id} style={styles.perguntaContainer}>
              <Text style={styles.label}>{pergunta.perguntas_descricao}</Text>
              <Estrelas
                rating={respostas[pergunta.perguntas_id] || 0}
                setRating={(nota) => handleSetResposta(pergunta.perguntas_id, nota)}
              />
            </View>
          ))}
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>Conte um pouco sobre sua experiência</Text>
            <TextInput
              style={styles.commentInput}
              value={comentario}
              onChangeText={handleComentarioChange}
              placeholder="Ex.: Produtos chegaram embalados e dentro da validade."
              placeholderTextColor="#9aa0a6"
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.commentCounter}>{comentario.length}/500</Text>
          </View>
          <View style={styles.buttonContainer}>
            {submitLoading ? (<ActivityIndicator size="large" color="#28a745" />) : (
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                    <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AvaliacaoQuestionarioScreen;