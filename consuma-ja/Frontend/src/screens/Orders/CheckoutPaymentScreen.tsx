import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Animated, Easing, StyleSheet } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { configStyles } from '../../common/styles/Core/configScreen.styled';
import promocaoService from '../../services/promocaoService';
import orderService from '../../services/orderService';
import { useApplication } from '../../contexts/ApplicationContext/ApplicationContext';
import { useConfig } from '../../contexts/ConfigContext/configContext';
import { useCart } from '../../contexts/CartContext/cartContext';

const PAYMENT_OPTIONS = [
  { key: 'cartao_credito', label: 'Cartão de Crédito' },
  { key: 'cartao_debito', label: 'Cartão de Débito' },
  { key: 'pix', label: 'PIX' },
  { key: 'boleto', label: 'Boleto bancário' },
];

type ParcelamentoConfig = {
  maxParcelas: number;
  parcelasSemJuros: number;
  valorMinParcela: number | null;
  jurosPercentual: number | null;
};

type PixInfo = {
  code: string;
  expiresAt: Date | null;
};

type BoletoData = {
  linhaDigitavel: string;
  codigoBarras: string;
  vencimento: Date;
  referencia: string;
};

type CardFields = {
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
};

type CardErrors = Partial<Record<keyof CardFields, string>>;

const defaultCardFields: CardFields = {
  holder: '',
  number: '',
  expiry: '',
  cvv: '',
};

const sanitizeCardNumber = (value: string) => value.replace(/\D/g, '').slice(0, 19);

const formatCardNumberInput = (value: string) => {
  const sanitized = sanitizeCardNumber(value);
  return sanitized.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiryInput = (value: string) => {
  const sanitized = value.replace(/\D/g, '').slice(0, 4);
  if (sanitized.length <= 2) {
    return sanitized;
  }
  return `${sanitized.slice(0, 2)}/${sanitized.slice(2)}`;
};

const passesLuhnCheck = (digits: string) => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(digits.charAt(i), 10);

    if (Number.isNaN(digit)) {
      return false;
    }

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const isExpiryValid = (value: string) => {
  if (!/^\d{2}\/\d{2}$/.test(value)) {
    return false;
  }
  const [monthRaw, yearRaw] = value.split('/');
  const month = Number(monthRaw);
  const yearTwoDigits = Number(yearRaw);

  if (month < 1 || month > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYearTwoDigits = Number(currentDate.getFullYear().toString().slice(-2));
  const currentMonth = currentDate.getMonth() + 1;

  if (yearTwoDigits < currentYearTwoDigits) {
    return false;
  }

  if (yearTwoDigits === currentYearTwoDigits && month < currentMonth) {
    return false;
  }

  // Consider cartões com validade até 20 anos no futuro
  if (yearTwoDigits > currentYearTwoDigits + 20) {
    return false;
  }

  return true;
};

const randomDigits = (length: number) => Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const formatBoletoLinhaDigitavel = (digits: string) =>
  `${digits.slice(0, 5)}.${digits.slice(5, 10)} ${digits.slice(10, 15)}.${digits.slice(15, 21)} ${digits.slice(
    21,
    26,
  )}.${digits.slice(26, 32)} ${digits.slice(32, 33)} ${digits.slice(33)}`;

const buildPixPayload = (amount: number) => {
  const randomSegment = Math.random().toString(36).substring(2, 10).toUpperCase();
  const amountSegment = amount.toFixed(2).replace(/[^0-9]/g, '');
  return `00020126360014BR.GOV.BCB.PIX0114CONSUMAJA${randomSegment}5204000053039865407${amountSegment}5802BR5920ConsumaJa Online6009SAO PAULO62070503***6304`;
};

const CheckoutPaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useApplication();
  const { metodosPagamento, loadingData: configLoading, refreshMetodosPagamento } = useConfig();
    useFocusEffect(
      useCallback(() => {
        refreshMetodosPagamento?.();
      }, [refreshMetodosPagamento]),
    );

  const { clearCart } = useCart();
  const saleData = route.params?.saleData;
  const totalValue = useMemo(
    () => Number(saleData?.valor_total ?? saleData?.venda_total ?? saleData?.total ?? 0),
    [saleData],
  );

  const [method, setMethod] = useState<string>('cartao_credito');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const [pixInfo, setPixInfo] = useState<PixInfo>({ code: '', expiresAt: null });
  const [pixSimulating, setPixSimulating] = useState(false);
  const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
  const [boletoEmitting, setBoletoEmitting] = useState(false);
  const [boletoPago, setBoletoPago] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [parcelamentoConfig, setParcelamentoConfig] = useState<ParcelamentoConfig>({
    maxParcelas: 1,
    parcelasSemJuros: 1,
    valorMinParcela: null,
    jurosPercentual: null,
  });
  const [useManualCard, setUseManualCard] = useState(false);
  const [cardFields, setCardFields] = useState<CardFields>({ ...defaultCardFields });
  const [cardErrors, setCardErrors] = useState<CardErrors>({});
  const [paymentValidated, setPaymentValidated] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCreditCard = useMemo(() => method === 'cartao_credito', [method]);
  const methodIsCard = method === 'cartao_credito' || method === 'cartao_debito';

  const availableCards = useMemo(
    () => metodosPagamento.filter((m) => m.tipo === method),
    [metodosPagamento, method],
  );

  const fornecedorCreditFee = useMemo(() => {
    if (!isCreditCard) {
      return null;
    }
    const raw = parcelamentoConfig.jurosPercentual;
    if (raw === null || raw === undefined) {
      return null;
    }
    return Number(raw);
  }, [isCreditCard, parcelamentoConfig.jurosPercentual]);

  const requiresManualCardData = useMemo(
    () => methodIsCard && (useManualCard || availableCards.length === 0),
    [methodIsCard, useManualCard, availableCards.length],
  );

  useEffect(() => {
    setSelectedCardId(null);
  }, [method]);

  useEffect(() => {
    if (method !== 'pix') {
      setPixConfirmed(false);
    }
  }, [method]);

  useEffect(() => {
    if (!selectedCardId && availableCards.length > 0) {
      const first = availableCards[0];
      setSelectedCardId(first.id?.toString() || first.numero_final || null);
    }
  }, [availableCards, selectedCardId]);

  useEffect(() => {
    if (!methodIsCard) {
      setUseManualCard(false);
      setCardFields({ ...defaultCardFields });
      setCardErrors({});
    }
  }, [methodIsCard]);

  useEffect(() => {
    if (methodIsCard && availableCards.length === 0) {
      setUseManualCard(true);
    }
  }, [methodIsCard, availableCards.length]);

  useEffect(() => {
    setPaymentValidated(false);
  }, [
    method,
    selectedCardId,
    pixConfirmed,
    boletoData,
    boletoPago,
    useManualCard,
    cardFields.holder,
    cardFields.number,
    cardFields.expiry,
    cardFields.cvv,
  ]);

  const handleCardFieldChange = useCallback((field: keyof CardFields, rawValue: string) => {
    setCardFields((prev) => {
      let nextValue = rawValue;

      if (field === 'number') {
        nextValue = formatCardNumberInput(rawValue);
      } else if (field === 'expiry') {
        nextValue = formatExpiryInput(rawValue);
      } else if (field === 'cvv') {
        nextValue = rawValue.replace(/\D/g, '').slice(0, 4);
      }

      return { ...prev, [field]: nextValue };
    });

    if (cardErrors[field]) {
      setCardErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [cardErrors]);

  const validateCardInputs = useCallback(() => {
    const errors: CardErrors = {};
    const sanitizedNumber = sanitizeCardNumber(cardFields.number);
    const trimmedHolder = cardFields.holder.trim();
    const cvvDigits = cardFields.cvv.replace(/\D/g, '');

    if (!sanitizedNumber) {
      errors.number = 'Informe o número do cartão';
    } else if (sanitizedNumber.length < 13 || sanitizedNumber.length > 19 || !passesLuhnCheck(sanitizedNumber)) {
      errors.number = 'Número do cartão inválido';
    }

    if (!trimmedHolder) {
      errors.holder = 'Informe o nome impresso no cartão';
    }

    if (!isExpiryValid(cardFields.expiry)) {
      errors.expiry = 'Validade inválida (MM/AA)';
    }

    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      errors.cvv = 'CVV inválido';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  }, [cardFields]);

  const handleSimulatePixPayment = () => {
    if (pixSimulating || pixConfirmed) {
      return;
    }
    setPixSimulating(true);
    if (pixTimerRef.current) {
      clearTimeout(pixTimerRef.current);
    }
    pixTimerRef.current = setTimeout(() => {
      setPixSimulating(false);
      setPixConfirmed(true);
      Alert.alert('PIX confirmado', 'Recebemos a confirmação de pagamento via PIX.');
    }, 1800);
  };

  const handleEmitBoleto = () => {
    if (boletoEmitting) {
      return;
    }
    setBoletoEmitting(true);
    setTimeout(() => {
      const digits = randomDigits(47);
      const linhaDigitavel = formatBoletoLinhaDigitavel(digits);
      const vencimento = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      setBoletoData({
        linhaDigitavel,
        codigoBarras: digits.slice(0, 44),
        vencimento,
        referencia: `BOL-${Date.now()}`,
      });
      setBoletoPago(false);
      setBoletoEmitting(false);
      Alert.alert('Boleto emitido', 'Utilize o código gerado para simular o pagamento.');
    }, 1200);
  };

  const handleSimularBoletoPago = () => {
    if (!boletoData) {
      Alert.alert('Boleto não emitido', 'Emita o boleto antes de confirmar o pagamento.');
      return;
    }
    setBoletoPago(true);
    Alert.alert('Pagamento registrado', 'Simulação de pagamento do boleto concluída.');
  };

  // Busca configuração de pagamento do fornecedor da promoção para definir regras de parcelamento
  useEffect(() => {
    const loadParcelasConfig = async () => {
      const defaultConfig: ParcelamentoConfig = {
        maxParcelas: totalValue >= 200 ? 3 : 1,
        parcelasSemJuros: 1,
        valorMinParcela: null,
        jurosPercentual: null,
      };

      try {
        const fornecedorPessoaIdRaw =
          saleData?.fornecedor_pessoa_id ??
          saleData?.fornecedorPessoaId ??
          saleData?.fornecedor?.pessoa_id ??
          saleData?.fornecedor?.id ??
          saleData?.JURIDICA_PESSOA_pessoa_id ??
          null;
        const fornecedorPessoaId = fornecedorPessoaIdRaw ? Number(fornecedorPessoaIdRaw) : null;

        if (!fornecedorPessoaId) {
          setParcelamentoConfig(defaultConfig);
          return;
        }

        const config = await promocaoService.buscarConfiguracaoPagamentoFornecedor(fornecedorPessoaId);
        const maxParcelas = Math.max(
          1,
          Number(config?.max_parcelas ?? config?.maxParcelas ?? defaultConfig.maxParcelas) || defaultConfig.maxParcelas,
        );
        const parcelasSemJuros = Math.max(
          1,
          Math.min(
            Number(config?.parcelas_sem_juros ?? config?.parcelasSemJuros ?? defaultConfig.parcelasSemJuros) || 1,
            maxParcelas,
          ),
        );
        const parsedValorMin =
          config?.valor_min_parcela !== undefined && config?.valor_min_parcela !== null
            ? Number(config.valor_min_parcela)
            : null;
        const parsedJuros =
          config?.juros_percentual !== undefined && config?.juros_percentual !== null
            ? Number(config.juros_percentual)
            : null;

        setParcelamentoConfig({
          maxParcelas,
          parcelasSemJuros,
          valorMinParcela:
            parsedValorMin !== null && Number.isFinite(parsedValorMin) ? parsedValorMin : defaultConfig.valorMinParcela,
          jurosPercentual:
            parsedJuros !== null && Number.isFinite(parsedJuros) ? parsedJuros : defaultConfig.jurosPercentual,
        });
      } catch (e) {
        setParcelamentoConfig(defaultConfig);
      }
    };

    loadParcelasConfig();
  }, [saleData, totalValue]);

  const regeneratePixCode = useCallback(() => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    setPixInfo({
      code: buildPixPayload(totalValue),
      expiresAt,
    });
    setPixConfirmed(false);
    setPixSimulating(false);
  }, [totalValue]);

  useEffect(() => {
    if (method === 'pix') {
      regeneratePixCode();
    } else {
      setPixConfirmed(false);
      setPixSimulating(false);
      if (pixTimerRef.current) {
        clearTimeout(pixTimerRef.current);
        pixTimerRef.current = null;
      }
    }
  }, [method, regeneratePixCode]);

  useEffect(() => {
    return () => {
      if (pixTimerRef.current) {
        clearTimeout(pixTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (method !== 'boleto') {
      setBoletoData(null);
      setBoletoEmitting(false);
      setBoletoPago(false);
    }
  }, [method]);

  const startProgressFill = useCallback(() => {
    progressAnim.stopAnimation();
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 0.85,
      duration: 2200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const finishProgressFill = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => resolve());
    });
  }, [progressAnim]);

  const resetProgressFill = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => resolve());
    });
  }, [progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shouldShowManualCardForm = requiresManualCardData;

  const manualCardForm = shouldShowManualCardForm ? (
    <View style={styles.manualCardWrapper}>
      <Text style={styles.subheading}>Dados do cartão nesta compra</Text>
      <TextInput
        style={configStyles.input}
        placeholder="Nome impresso no cartão"
        value={cardFields.holder}
        autoCapitalize="characters"
        onChangeText={(value) => handleCardFieldChange('holder', value)}
      />
      {cardErrors.holder ? <Text style={configStyles.errorText}>{cardErrors.holder}</Text> : null}

      <TextInput
        style={[configStyles.input, { marginTop: 10 }]}
        placeholder="Número do cartão"
        value={cardFields.number}
        keyboardType="numeric"
        onChangeText={(value) => handleCardFieldChange('number', value)}
      />
      {cardErrors.number ? <Text style={configStyles.errorText}>{cardErrors.number}</Text> : null}

      <View style={styles.inlineFields}>
        <View style={[styles.inlineField, styles.inlineFieldSpacing]}>
          <TextInput
            style={configStyles.input}
            placeholder="MM/AA"
            value={cardFields.expiry}
            keyboardType="numeric"
            maxLength={5}
            onChangeText={(value) => handleCardFieldChange('expiry', value)}
          />
          {cardErrors.expiry ? <Text style={configStyles.errorText}>{cardErrors.expiry}</Text> : null}
        </View>
        <View style={styles.inlineField}>
          <TextInput
            style={configStyles.input}
            placeholder="CVV"
            value={cardFields.cvv}
            keyboardType="numeric"
            secureTextEntry
            maxLength={4}
            onChangeText={(value) => handleCardFieldChange('cvv', value)}
          />
          {cardErrors.cvv ? <Text style={configStyles.errorText}>{cardErrors.cvv}</Text> : null}
        </View>
      </View>

      <Text style={configStyles.paymentInfoText}>
        Os dados são usados apenas para esta transação e não ficam salvos.
      </Text>
    </View>
  ) : null;

  const handleValidatePayment = useCallback(() => {
    if (methodIsCard) {
      if (requiresManualCardData) {
        const isValidCard = validateCardInputs();
        if (!isValidCard) {
          Alert.alert('Cartão inválido', 'Corrija os dados do cartão antes de continuar.');
          return;
        }
      } else if (!selectedCardId) {
        Alert.alert('Selecione um cartão', 'Escolha um cartão salvo ou informe um novo cartão.');
        return;
      }
    }

    if (method === 'pix' && !pixConfirmed) {
      Alert.alert('Confirme o PIX', 'Marque que o PIX foi pago para continuar.');
      return;
    }

    if (method === 'boleto') {
      if (!boletoData) {
        Alert.alert('Emita o boleto', 'Gere o boleto para continuar.');
        return;
      }
      if (!boletoPago) {
        Alert.alert('Confirme o boleto', 'Simule o pagamento do boleto antes de continuar.');
        return;
      }
    }

    setPaymentValidated(true);
    Alert.alert('Pagamento validado', 'Informações verificadas com sucesso. Agora você pode finalizar o pedido.');
  }, [
    method,
    methodIsCard,
    pixConfirmed,
    requiresManualCardData,
    selectedCardId,
    validateCardInputs,
    boletoData,
    boletoPago,
  ]);

  const handleConfirmPayment = async () => {
    if (isProcessing) {
      return;
    }

    if (!paymentValidated) {
      Alert.alert('Validação pendente', 'Valide as informações de pagamento antes de finalizar o pedido.');
      return;
    }

    if (!saleData || !Array.isArray(saleData?.itens) || saleData.itens.length === 0) {
      Alert.alert('Sem itens', 'Não encontramos itens para finalizar. Retorne ao carrinho e tente novamente.');
      return;
    }

    if (method === 'pix' && !pixConfirmed) {
      Alert.alert('Confirme o PIX', 'Marque que o PIX foi pago para continuar.');
      return;
    }

    const totalItens = Number(
      saleData?.quantidade_total_itens ??
        saleData?.total_itens ??
        saleData?.itens?.reduce((acc: number, item: any) => acc + Number(item.quantidade || 0), 0) ??
        0,
    );

    const paymentTotal = totalValue;
    const sanitizedManualNumber = requiresManualCardData ? sanitizeCardNumber(cardFields.number) : null;
    const manualCardPayload = requiresManualCardData
      ? {
          numero: sanitizedManualNumber,
          nome: cardFields.holder.trim(),
          validade: cardFields.expiry.trim(),
          cvv: cardFields.cvv.replace(/\D/g, ''),
        }
      : null;

    const paymentInfo = {
      metodo: method,
      parcelas: 1,
      pix_confirmado: pixConfirmed,
      cartao_id: requiresManualCardData ? null : selectedCardId,
      cartao_manual: manualCardPayload,
      total: paymentTotal,
      total_sem_juros: totalValue,
      validado: true,
      pix:
        method === 'pix'
          ? {
              codigo: pixInfo.code,
              expiracao: pixInfo.expiresAt?.toISOString() ?? null,
              confirmado: pixConfirmed,
            }
          : null,
      boleto:
        method === 'boleto' && boletoData
          ? {
              linhaDigitavel: boletoData.linhaDigitavel,
              codigoBarras: boletoData.codigoBarras,
              vencimento: boletoData.vencimento.toISOString(),
              referencia: boletoData.referencia,
              pago: boletoPago,
            }
          : null,
    };

    const payload = {
      ...saleData,
      quantidade_total_itens: totalItens,
      valor_total: totalValue,
      venda_total: totalValue,
      total: totalValue,
      pagamento: paymentInfo,
      metodo_pagamento: paymentInfo.metodo,
      parcelas: paymentInfo.parcelas,
      detalhes_pagamento: paymentInfo,
      retirada_no_fornecedor: Boolean(saleData?.isPickup),
      endereco_id: saleData?.isPickup ? null : saleData?.endereco_id,
      pessoa_id: user?.pessoa_id ?? saleData?.pessoa_id,
    };

    try {
      setIsProcessing(true);
      startProgressFill();
      const resp = await orderService.finalizeSale(payload);
      // Backend retorna detalhes completos da venda
      const vendaId = resp?.venda_id ?? resp?.vendaId ?? resp?.id ?? null;
      if (!vendaId) {
        throw new Error('Não foi possível criar a venda (resposta inesperada).');
      }

      try {
        await clearCart();
      } catch (cartError) {
        console.warn('[Checkout] Falha ao limpar carrinho após venda:', cartError);
      }

      await finishProgressFill();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard', params: { screen: 'Inicio' } }],
      });
    } catch (err: any) {
      Alert.alert('Erro no pagamento', err?.response?.data?.message || err?.message || 'Erro ao processar o pagamento.');
      await resetProgressFill();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={configStyles.container} keyboardShouldPersistTaps="handled">
      <Text style={configStyles.sectionTitle}>Método de Pagamento</Text>
      <Text style={configStyles.sectionDescription}>Escolha como deseja pagar.</Text>

      {PAYMENT_OPTIONS.map((opt) => (
        <TouchableOpacity key={opt.key} style={[configStyles.paymentCard, method === opt.key && { borderColor: '#4CAF50' }]} onPress={() => setMethod(opt.key)}>
          <Text style={configStyles.paymentCardTitle}>{opt.label}</Text>
        </TouchableOpacity>
      ))}

      {method === 'cartao_credito' && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.subheading}>Cartões de crédito cadastrados</Text>
          {configLoading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : availableCards.length === 0 ? (
            <Text style={configStyles.paymentInfoText}>Nenhum cartão de crédito cadastrado nas configurações.</Text>
          ) : (
            availableCards.map((card) => (
              <TouchableOpacity
                key={card.id || card.numero_final || card.titulo}
                style={[
                  configStyles.paymentCard,
                  selectedCardId === (card.id?.toString() || card.numero_final || card.titulo) && { borderColor: '#4CAF50', backgroundColor: '#f3fbf5' },
                ]}
                onPress={() => setSelectedCardId(card.id?.toString() || card.numero_final || card.titulo)}
              >
                <Text style={configStyles.paymentCardTitle}>{card.titulo || `•••• ${card.numero_final ?? ''}`}</Text>
                <Text style={configStyles.paymentCardDetail}>{card.nome_cartao || card.detalhe}</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={[configStyles.addPaymentButton, { marginTop: 8 }]}
            onPress={() => navigation.navigate('Dashboard', { screen: 'Configuracoes', params: { initialTab: 'pagamento' } })}
          >
            <Text style={configStyles.addPaymentText}>Adicionar novo cartão</Text>
          </TouchableOpacity>

          {availableCards.length > 0 && (
            <TouchableOpacity
              style={[
                configStyles.secondaryButton,
                styles.manualToggleButton,
                useManualCard && styles.manualToggleButtonActive,
              ]}
              onPress={() => setUseManualCard((prev) => !prev)}
            >
              <Text style={configStyles.secondaryButtonText}>
                {useManualCard ? 'Usar cartão salvo' : 'Inserir novo cartão nesta etapa'}
              </Text>
            </TouchableOpacity>
          )}

          {manualCardForm}

          {isCreditCard && (
            <View style={styles.feeBox}>
              <Text style={configStyles.label}>Taxa do fornecedor</Text>
              <Text style={configStyles.paymentInfoText}>
                {fornecedorCreditFee !== null
                  ? `Pagamentos no crédito têm acréscimo de ${fornecedorCreditFee.toFixed(2)}% aplicado pelo fornecedor.`
                  : 'Este fornecedor não aplica taxa adicional para cartão de crédito.'}
              </Text>
            </View>
          )}
        </View>
      )}

      {method === 'cartao_debito' && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.subheading}>Cartões de débito cadastrados</Text>
          {configLoading ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : availableCards.length === 0 ? (
            <Text style={configStyles.paymentInfoText}>Nenhum cartão de débito cadastrado nas configurações.</Text>
          ) : (
            availableCards.map((card) => (
              <TouchableOpacity
                key={card.id || card.numero_final || card.titulo}
                style={[
                  configStyles.paymentCard,
                  selectedCardId === (card.id?.toString() || card.numero_final || card.titulo) && { borderColor: '#4CAF50', backgroundColor: '#f3fbf5' },
                ]}
                onPress={() => setSelectedCardId(card.id?.toString() || card.numero_final || card.titulo)}
              >
                <Text style={configStyles.paymentCardTitle}>{card.titulo || `•••• ${card.numero_final ?? ''}`}</Text>
                <Text style={configStyles.paymentCardDetail}>{card.nome_cartao || card.detalhe}</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={[configStyles.addPaymentButton, { marginTop: 8 }]}
            onPress={() => navigation.navigate('Dashboard', { screen: 'Configuracoes', params: { initialTab: 'pagamento' } })}
          >
            <Text style={configStyles.addPaymentText}>Adicionar novo cartão</Text>
          </TouchableOpacity>

          {availableCards.length > 0 && (
            <TouchableOpacity
              style={[
                configStyles.secondaryButton,
                styles.manualToggleButton,
                useManualCard && styles.manualToggleButtonActive,
              ]}
              onPress={() => setUseManualCard((prev) => !prev)}
            >
              <Text style={configStyles.secondaryButtonText}>
                {useManualCard ? 'Usar cartão salvo' : 'Inserir novo cartão nesta etapa'}
              </Text>
            </TouchableOpacity>
          )}

          {manualCardForm}
        </View>
      )}

      {method === 'pix' && (
        <View style={{ marginTop: 12 }}>
          <Text style={configStyles.paymentInfoText}>
            Escaneie o QR Code do seu banco ou copie o código abaixo para concluir o pagamento instantâneo.
          </Text>
          <View style={styles.pixCodeBox}>
            <Text style={styles.pixCodeLabel}>Código copia e cola</Text>
            {pixInfo.code ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text selectable style={styles.pixCodeValue}>
                  {pixInfo.code}
                </Text>
              </ScrollView>
            ) : (
              <ActivityIndicator size="small" color="#4CAF50" />
            )}
          </View>
          {pixInfo.expiresAt && (
            <Text style={configStyles.paymentInfoText}>
              Expira às {pixInfo.expiresAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
            </Text>
          )}
          <TouchableOpacity style={[configStyles.secondaryButton, { marginTop: 10 }]} onPress={regeneratePixCode}>
            <Text style={configStyles.secondaryButtonText}>Gerar novo código PIX</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              configStyles.secondaryButton,
              { marginTop: 8, backgroundColor: pixConfirmed ? '#e8f5e9' : undefined },
            ]}
            onPress={handleSimulatePixPayment}
            disabled={pixSimulating}
          >
            {pixSimulating ? (
              <ActivityIndicator size="small" color="#1B5E20" />
            ) : (
              <Text
                style={[
                  configStyles.secondaryButtonText,
                  pixConfirmed && { color: '#1B5E20', fontWeight: '600' },
                ]}
              >
                {pixConfirmed ? 'PIX confirmado' : 'Simular pagamento PIX'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {method === 'boleto' && (
        <View style={{ marginTop: 12 }}>
          <Text style={configStyles.paymentInfoText}>
            Gere o boleto para obter a linha digitável e, em seguida, confirme o pagamento para continuar.
          </Text>
          <TouchableOpacity
            style={[configStyles.secondaryButton, { marginTop: 8 }]}
            onPress={handleEmitBoleto}
            disabled={boletoEmitting}
          >
            {boletoEmitting ? (
              <ActivityIndicator size="small" color="#1B5E20" />
            ) : (
              <Text style={configStyles.secondaryButtonText}>
                {boletoData ? 'Gerar novamente' : 'Emitir boleto'}
              </Text>
            )}
          </TouchableOpacity>

          {boletoData && (
            <View style={styles.boletoCard}>
              <Text style={styles.boletoLabel}>Linha digitável</Text>
              <Text selectable style={styles.boletoValue}>{boletoData.linhaDigitavel}</Text>
              <Text style={styles.boletoLabel}>Vencimento</Text>
              <Text style={styles.boletoValue}>{boletoData.vencimento.toLocaleDateString('pt-BR')}</Text>
              <Text style={styles.boletoLabel}>Referência</Text>
              <Text style={styles.boletoValue}>{boletoData.referencia}</Text>

              {boletoPago ? (
                <View style={styles.boletoPaidBadge}>
                  <Text style={styles.boletoPaidBadgeText}>Pagamento confirmado (simulação)</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[configStyles.secondaryButton, { marginTop: 10 }]}
                  onPress={handleSimularBoletoPago}
                >
                  <Text style={configStyles.secondaryButtonText}>Simular pagamento do boleto</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}

          <TouchableOpacity
            style={[
              configStyles.secondaryButton,
              styles.validateButton,
              paymentValidated && styles.paymentValidatedButton,
            ]}
            onPress={handleValidatePayment}
            disabled={isProcessing}
          >
            <Text
              style={[
                configStyles.secondaryButtonText,
                paymentValidated && styles.paymentValidatedText,
              ]}
            >
              {paymentValidated ? 'Pagamento validado' : 'Validar informações do pagamento'}
            </Text>
          </TouchableOpacity>

      <TouchableOpacity
        style={[
          configStyles.button,
          configStyles.saveButton,
          styles.confirmButton,
              {
                marginTop: 16,
                opacity: isProcessing || !paymentValidated ? 0.85 : 1,
              },
        ]}
        onPress={handleConfirmPayment}
            disabled={isProcessing || !paymentValidated}
        activeOpacity={0.8}
      >
        <View style={styles.progressContent}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          <Text style={configStyles.buttonText}>{isProcessing ? 'Processando pedido...' : 'Confirmar pagamento e criar pedido'}</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutPaymentScreen;

const styles = StyleSheet.create({
  confirmButton: {
    overflow: 'hidden',
  },
  progressContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1B5E20',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1d1d1d',
  },
  manualCardWrapper: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe3eb',
    backgroundColor: '#fff',
  },
  inlineFields: {
    flexDirection: 'row',
    marginTop: 12,
  },
  inlineField: {
    flex: 1,
  },
  inlineFieldSpacing: {
    marginRight: 8,
  },
  manualToggleButton: {
    marginTop: 12,
  },
  manualToggleButtonActive: {
    backgroundColor: '#e8f5e9',
    borderColor: '#39a067',
  },
  pixCodeBox: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dfe3eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  pixCodeLabel: {
    fontSize: 12,
    color: '#6d6d6d',
    marginBottom: 4,
  },
  pixCodeValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  boletoCard: {
    marginTop: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dfe3eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  boletoLabel: {
    fontSize: 12,
    color: '#6d6d6d',
    marginTop: 8,
  },
  boletoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1d',
  },
  boletoPaidBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#e8f5e9',
  },
  boletoPaidBadgeText: {
    color: '#1B5E20',
    fontWeight: '600',
  },
  feeBox: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe3eb',
    backgroundColor: '#fdfdfd',
  },
  validateButton: {
    marginTop: 18,
  },
  paymentValidatedButton: {
    backgroundColor: '#e8f5e9',
    borderColor: '#1B5E20',
  },
  paymentValidatedText: {
    color: '#1B5E20',
    fontWeight: '600',
  },
});
