"use client";

import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { configStyles } from "../../common/styles/Core/configScreen.styled";
import { ConfigProvider, useConfig } from "../../contexts/ConfigContext/configContext";
import pessoaService from "../../services/pessoaService";

const formatCPF = (value: string): string => {
  const raw = value.replace(/\D/g, "").slice(0, 11);
  if (raw.length <= 3) return raw;
  if (raw.length <= 6) return raw.replace(/(\d{3})(\d{1,})/, "$1.$2");
  if (raw.length <= 9) return raw.replace(/(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3");
  return raw.replace(/(\d{3})(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3-$4");
};

const formatCNPJ = (value: string): string => {
  const raw = value.replace(/\D/g, "").slice(0, 14);
  if (raw.length <= 2) return raw;
  if (raw.length <= 5) return raw.replace(/(\d{2})(\d{1,})/, "$1.$2");
  if (raw.length <= 8) return raw.replace(/(\d{2})(\d{3})(\d{1,})/, "$1.$2.$3");
  if (raw.length <= 12) return raw.replace(/(\d{2})(\d{3})(\d{3})(\d{1,})/, "$1.$2.$3/$4");
  return raw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,})/, "$1.$2.$3/$4-$5");
};

const formatTelefone = (value: string): string => {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

const formatCEP = (value: string): string => {
  const raw = value.replace(/\D/g, "").slice(0, 8);
  if (raw.length <= 5) return raw;
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
};

const PAYMENT_TYPE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Cartão de Crédito", value: "cartao_credito" },
  { label: "Cartão de Débito", value: "cartao_debito" },
  { label: "PIX", value: "pix" },
  { label: "PayPal", value: "paypal" },
  { label: "Boleto", value: "boleto" },
];

const PAYMENT_FORM_FIELDS_TO_RESET = [
  "numero_cartao",
  "nome_cartao",
  "data_validade",
  "cvv",
  "chave_pix",
  "email_paypal",
];

const ROUTE_ALLOWED_TABS = [
  "perfil",
  "endereco",
  "notificacoes",
  "seguranca",
  "pagamento",
  "fornecedor",
] as const;
type RouteAllowedTab = typeof ROUTE_ALLOWED_TABS[number];

type FornecedorPagamentoForm = {
  maxParcelas: string;
  parcelasSemJuros: string;
  valorMinParcela: string;
  jurosPercentual: string;
};

type FornecedorPagamentoConfig = {
  fornecedorId: number;
  max_parcelas: number;
  parcelas_sem_juros: number;
  valor_min_parcela: number | null;
  juros_percentual: number | null;
  atualizadoEm?: string | null;
};

const DEFAULT_FORNECEDOR_FORM: FornecedorPagamentoForm = {
  maxParcelas: "1",
  parcelasSemJuros: "1",
  valorMinParcela: "",
  jurosPercentual: "",
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "R$ 0,00";
  }

  return `R$ ${Number(value).toFixed(2).replace(".", ",")}`;
};

const ConfigScreenContent: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    activeTab,
    setActiveTab,
    nome,
    setNome,
    email,
    setEmail,
    telefone,
    setTelefone,
    tipoUsuario,
    cpf,
    cnpj,
    fornecedorNum,
    cep,
    setCep,
    rua,
    setRua,
    numero,
    setNumero,
    complemento,
    setComplemento,
    bairro,
    setBairro,
    cidade,
    setCidade,
    estado,
    setEstado,
    setCidadeId,
    loadingData,
    loadingSubmit,
    loadingCep,
    errors,
    setErrors,
    emailNotificacoes,
    setEmailNotificacoes,
    smsNotificacoes,
    setSmsNotificacoes,
    marketingNotificacoes,
    setMarketingNotificacoes,
    handleCepBlur,
    handleSubmitPerfil,
    handleSubmitEndereco,
    handleSubmitNotificacoes,
    senhaAtual,
    setSenhaAtual,
    novaSenha,
    setNovaSenha,
    confirmarSenha,
    setConfirmarSenha,
    autenticacao2FA,
    loading2FA,
    twoFASetupVisible,
    twoFAQRCode,
    twoFASecret,
    twoFAValidationCode,
    setTwoFAValidationCode,
    twoFAError,
    twoFASetupMode,
    handleToggleTwoFactor,
    handleConfirmTwoFactorCode,
    handleShowTwoFactorSetup,
    closeTwoFactorSetup,
    handleSubmitSeguranca,
    novoMetodoPagamento,
    setNovoMetodoPagamento,
    handleAdicionarMetodoPagamento,
    metodosPagamento,
    metodoPagamentoEmEdicao,
    handleRemoverMetodoPagamento,
    iniciarEdicaoMetodoPagamento,
    cancelarEdicaoMetodoPagamento,
    isEditandoMetodoPagamento,
    handleDefinirMetodoPagamentoPadrao,
    currentUserId,
  } = useConfig();

  const paymentTypeOptions = React.useMemo(() => PAYMENT_TYPE_OPTIONS, []);
  const paymentResetFields = React.useMemo(() => PAYMENT_FORM_FIELDS_TO_RESET, []);

  const [fornecedorForm, setFornecedorForm] = React.useState<FornecedorPagamentoForm>({ ...DEFAULT_FORNECEDOR_FORM });
  const [fornecedorFormErrors, setFornecedorFormErrors] = React.useState<Record<string, string>>({});
  const [fornecedorConfigLoading, setFornecedorConfigLoading] = React.useState(false);
  const [fornecedorConfigSaving, setFornecedorConfigSaving] = React.useState(false);
  const [fornecedorConfigError, setFornecedorConfigError] = React.useState<string | null>(null);
  const [fornecedorConfigMessage, setFornecedorConfigMessage] = React.useState<string | null>(null);
  const [fornecedorConfigAtual, setFornecedorConfigAtual] = React.useState<FornecedorPagamentoConfig | null>(null);
  const [targetFornecedorId, setTargetFornecedorId] = React.useState<number | null>(null);

  const [adminFornecedorSearch, setAdminFornecedorSearch] = React.useState("");
  const [adminFornecedores, setAdminFornecedores] = React.useState<any[]>([]);
  const [adminFornecedorLoading, setAdminFornecedorLoading] = React.useState(false);
  const [adminFornecedorSelecionado, setAdminFornecedorSelecionado] = React.useState<any | null>(null);

  const canManageFornecedorTab = tipoUsuario === "Juridica" || tipoUsuario === "Admin";
  const fornecedorAtualizadoEm = React.useMemo(() => {
    if (!fornecedorConfigAtual?.atualizadoEm) {
      return null;
    }

    const parsed = new Date(fornecedorConfigAtual.atualizadoEm);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleString();
  }, [fornecedorConfigAtual?.atualizadoEm]);
  const tabItems = React.useMemo(
    () =>
      [
        { key: "perfil", icon: "person-outline", label: "Perfil" },
        { key: "endereco", icon: "location-outline", label: "Endereço" },
        { key: "notificacoes", icon: "notifications-outline", label: "Notificações" },
        { key: "seguranca", icon: "shield-outline", label: "Segurança" },
        { key: "pagamento", icon: "card-outline", label: "Pagamento" },
        ...(canManageFornecedorTab
          ? [{ key: "fornecedor", icon: "briefcase-outline", label: "Fornecedor" }]
          : []),
      ],
    [canManageFornecedorTab],
  );

  React.useEffect(() => {
    const requestedTab = route.params?.initialTab;
    if (!requestedTab) {
      return;
    }

    const normalized = String(requestedTab).toLowerCase();
    if ((ROUTE_ALLOWED_TABS as readonly string[]).includes(normalized)) {
      if (normalized === "fornecedor" && !canManageFornecedorTab) {
        return;
      }
      setActiveTab(normalized as RouteAllowedTab);
    }
  }, [route.params?.initialTab, setActiveTab, canManageFornecedorTab]);

  React.useEffect(() => {
    if (!canManageFornecedorTab && activeTab === "fornecedor") {
      setActiveTab("perfil");
    }
  }, [activeTab, canManageFornecedorTab, setActiveTab]);

  const isCardPayment =
    novoMetodoPagamento.tipo === "cartao_credito" || novoMetodoPagamento.tipo === "cartao_debito";
  const isPixPayment = novoMetodoPagamento.tipo === "pix";
  const isPaypalPayment = novoMetodoPagamento.tipo === "paypal";
  const isBoletoPayment = novoMetodoPagamento.tipo === "boleto";

  const resetPaymentErrors = React.useCallback(
    (fields: string[]) => {
      if (!fields.length) return;
      const nextErrors = { ...errors };
      let changed = false;

      fields.forEach((field) => {
        if (nextErrors[field]) {
          delete nextErrors[field];
          changed = true;
        }
      });

      if (changed) {
        setErrors(nextErrors);
      }
    },
    [errors, setErrors],
  );

  const applyConfigToForm = React.useCallback((config?: Partial<FornecedorPagamentoConfig> | null) => {
    if (!config) {
      setFornecedorForm({ ...DEFAULT_FORNECEDOR_FORM });
      return;
    }

    setFornecedorForm({
      maxParcelas: String(config.max_parcelas ?? (config as any)?.maxParcelas ?? DEFAULT_FORNECEDOR_FORM.maxParcelas),
      parcelasSemJuros: String(
        config.parcelas_sem_juros ?? (config as any)?.parcelasSemJuros ?? DEFAULT_FORNECEDOR_FORM.parcelasSemJuros,
      ),
      valorMinParcela:
        config.valor_min_parcela !== null && config.valor_min_parcela !== undefined
          ? String(config.valor_min_parcela)
          : DEFAULT_FORNECEDOR_FORM.valorMinParcela,
      jurosPercentual:
        config.juros_percentual !== null && config.juros_percentual !== undefined
          ? String(config.juros_percentual)
          : DEFAULT_FORNECEDOR_FORM.jurosPercentual,
    });
  }, []);

  const loadFornecedorConfig = React.useCallback(
    async (fornecedorId: number | null) => {
      if (!fornecedorId) {
        return;
      }

      setFornecedorConfigLoading(true);
      setFornecedorConfigError(null);
      setFornecedorConfigMessage(null);
      setFornecedorFormErrors({});

      try {
        const config = await pessoaService.buscarConfiguracaoPagamentoFornecedor(fornecedorId);
        setTargetFornecedorId(fornecedorId);
        setFornecedorConfigAtual(config);
        applyConfigToForm(config);
      } catch (error: any) {
        const message = error?.response?.data?.message ?? error?.message ?? 'Não foi possível carregar a configuração.';
        setFornecedorConfigError(message);
      } finally {
        setFornecedorConfigLoading(false);
      }
    },
    [applyConfigToForm],
  );

  const fetchAdminFornecedores = React.useCallback(
    async (searchTerm?: string) => {
      setAdminFornecedorLoading(true);
      setFornecedorConfigError(null);

      try {
        const params: Record<string, any> = {
          pessoa_tipo: 'Juridica',
          limit: 20,
        };

        if (searchTerm && searchTerm.trim().length) {
          params.nomeQuery = searchTerm.trim();
        }

        const response = await pessoaService.listarPessoas(params);
        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];
        setAdminFornecedores(data);

        if (adminFornecedorSelecionado) {
          const stillPresent = data.some((item: any) => item.pessoa_id === adminFornecedorSelecionado.pessoa_id);
          if (!stillPresent) {
            setAdminFornecedorSelecionado(null);
            setFornecedorConfigAtual(null);
            setTargetFornecedorId(null);
            setFornecedorForm({ ...DEFAULT_FORNECEDOR_FORM });
            setFornecedorConfigMessage(null);
            setFornecedorFormErrors({});
            setFornecedorConfigError(null);
          }
        }
      } catch (error: any) {
        const message = error?.response?.data?.message ?? error?.message ?? 'Erro ao listar fornecedores.';
        setFornecedorConfigError(message);
        setAdminFornecedores([]);
      } finally {
        setAdminFornecedorLoading(false);
      }
    },
    [adminFornecedorSelecionado],
  );

  const handleFornecedorFieldChange = React.useCallback(
    (field: keyof FornecedorPagamentoForm, value: string) => {
      setFornecedorForm((prev) => ({
        ...prev,
        [field]: value,
      }));

      setFornecedorConfigMessage(null);
      setFornecedorConfigError(null);
      setFornecedorFormErrors((prev) => {
        if (!prev[field]) {
          return prev;
        }
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const validateFornecedorForm = React.useCallback(() => {
    const nextErrors: Record<string, string> = {};

    const maxParcelas = Number(fornecedorForm.maxParcelas);
    if (!Number.isFinite(maxParcelas) || maxParcelas < 1 || maxParcelas > 24) {
      nextErrors.maxParcelas = 'Informe um número entre 1 e 24 parcelas';
    }

    const parcelasSemJuros = Number(fornecedorForm.parcelasSemJuros);
    if (!Number.isFinite(parcelasSemJuros) || parcelasSemJuros < 1 || parcelasSemJuros > (Number.isFinite(maxParcelas) ? maxParcelas : 24)) {
      nextErrors.parcelasSemJuros = 'Parcelas sem juros devem ser entre 1 e o máximo definido';
    }

    if (fornecedorForm.valorMinParcela) {
      const valorMin = Number(fornecedorForm.valorMinParcela);
      if (!Number.isFinite(valorMin) || valorMin < 0) {
        nextErrors.valorMinParcela = 'Valor mínimo precisa ser um número positivo';
      }
    }

    if (fornecedorForm.jurosPercentual) {
      const juros = Number(fornecedorForm.jurosPercentual);
      if (!Number.isFinite(juros) || juros < 0) {
        nextErrors.jurosPercentual = 'Percentual de juros inválido';
      }
    }

    setFornecedorFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [fornecedorForm]);

  const handleSubmitFornecedorConfig = React.useCallback(async () => {
    const alvoFornecedorId = targetFornecedorId ?? currentUserId ?? adminFornecedorSelecionado?.pessoa_id ?? null;

    if (!alvoFornecedorId) {
      setFornecedorConfigError('Selecione um fornecedor para atualizar as configurações.');
      return;
    }

    if (!validateFornecedorForm()) {
      return;
    }

    setFornecedorConfigSaving(true);
    setFornecedorConfigMessage(null);
    setFornecedorConfigError(null);

    const payload = {
      max_parcelas: Number(fornecedorForm.maxParcelas),
      parcelas_sem_juros: Number(fornecedorForm.parcelasSemJuros),
      valor_min_parcela: fornecedorForm.valorMinParcela === '' ? null : Number(fornecedorForm.valorMinParcela),
      juros_percentual: fornecedorForm.jurosPercentual === '' ? null : Number(fornecedorForm.jurosPercentual),
    };

    try {
      const updated = await pessoaService.atualizarConfiguracaoPagamentoFornecedor(alvoFornecedorId, payload);
      setFornecedorConfigAtual(updated);
      applyConfigToForm(updated);
      setFornecedorConfigMessage('Configurações salvas com sucesso.');
    } catch (error: any) {
      const message = error?.response?.data?.message ?? error?.message ?? 'Não foi possível salvar as configurações.';
      setFornecedorConfigError(message);
    } finally {
      setFornecedorConfigSaving(false);
    }
  }, [adminFornecedorSelecionado, applyConfigToForm, currentUserId, fornecedorForm, targetFornecedorId, validateFornecedorForm]);

  const handleSelectAdminFornecedor = React.useCallback(
    (fornecedor: any) => {
      if (!fornecedor?.pessoa_id) {
        return;
      }
      setAdminFornecedorSelecionado(fornecedor);
      setTargetFornecedorId(fornecedor.pessoa_id);
      loadFornecedorConfig(fornecedor.pessoa_id);
    },
    [loadFornecedorConfig],
  );

  React.useEffect(() => {
    if (activeTab !== "fornecedor" || !canManageFornecedorTab) {
      return;
    }

    if (tipoUsuario === "Admin") {
      fetchAdminFornecedores();
      return;
    }

    if (tipoUsuario === "Juridica" && currentUserId) {
      loadFornecedorConfig(currentUserId);
    }
  }, [activeTab, canManageFornecedorTab, currentUserId, fetchAdminFornecedores, loadFornecedorConfig, tipoUsuario]);

  const handleSelectPaymentType = React.useCallback(
    (tipo: string) => {
      if (novoMetodoPagamento.tipo === tipo) return;

      const nextMetodo = {
        tipo: tipo as typeof novoMetodoPagamento.tipo,
        numero_cartao: "",
        nome_cartao: "",
        data_validade: "",
        cvv: "",
        chave_pix: "",
        email_paypal: "",
      } as typeof novoMetodoPagamento;

      setNovoMetodoPagamento(nextMetodo);
      resetPaymentErrors(paymentResetFields);
    },
    [novoMetodoPagamento.tipo, setNovoMetodoPagamento, resetPaymentErrors, paymentResetFields],
  );

  const handleUpdatePaymentField = React.useCallback(
    (field: string, value: string) => {
      const updated = { ...novoMetodoPagamento, [field]: value } as typeof novoMetodoPagamento;
      setNovoMetodoPagamento(updated);
      resetPaymentErrors([field]);
    },
    [novoMetodoPagamento, setNovoMetodoPagamento, resetPaymentErrors],
  );

  const handleChangeNumeroCartao = React.useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
      handleUpdatePaymentField("numero_cartao", formatted);
    },
    [handleUpdatePaymentField],
  );

  const handleChangeDataValidade = React.useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      let formatted = digits;

      if (digits.length >= 3) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      }

      handleUpdatePaymentField("data_validade", formatted);
    },
    [handleUpdatePaymentField],
  );

  const handleChangeCVV = React.useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      handleUpdatePaymentField("cvv", digits);
    },
    [handleUpdatePaymentField],
  );

  const renderDocumento = () => {
    if (tipoUsuario === "Fisica") return formatCPF(cpf ?? "");
    if (tipoUsuario === "Juridica") return formatCNPJ(cnpj ?? "");
    return "";
  };

  if (loadingData) {
    return (
      <View style={configStyles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={configStyles.loadingText}>Carregando configurações...</Text>
      </View>
    );
  }

  if (errors.form) {
    return (
      <View style={configStyles.centered}>
        <Text style={configStyles.errorText}>{errors.form}</Text>
        <TouchableOpacity
          style={[configStyles.button, configStyles.retryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={configStyles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={configStyles.mainContainer}>
      <View style={configStyles.header}>
        <Text style={configStyles.headerTitle}>Configurações</Text>
      </View>

      <View style={configStyles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabItems.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[configStyles.tabButton, activeTab === tab.key && configStyles.activeTabButton]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={20}
                color={activeTab === tab.key ? "#FFFFFF" : "#4CAF50"}
              />
              <Text style={[configStyles.tabText, activeTab === tab.key && configStyles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={configStyles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={configStyles.container}>
          {activeTab === "perfil" && (
            <>
              <Text style={configStyles.sectionTitle}>Informações Pessoais</Text>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Nome Completo:</Text>
                <TextInput
                  style={[configStyles.input, errors.nome && configStyles.inputError]}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Nome completo"
                  autoCapitalize="words"
                />
                {errors.nome && <Text style={configStyles.errorText}>{errors.nome}</Text>}
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>
                  {tipoUsuario === "Fisica" ? "CPF:" : tipoUsuario === "Juridica" ? "CNPJ:" : "Documento:"}
                </Text>
                <TextInput
                  style={[configStyles.input, configStyles.inputDisabled]}
                  value={renderDocumento()}
                  editable={false}
                />
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Email:</Text>
                <TextInput
                  style={[configStyles.input, errors.email && configStyles.inputError]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="seuemail@exemplo.com"
                />
                {errors.email && <Text style={configStyles.errorText}>{errors.email}</Text>}
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Telefone:</Text>
                <TextInput
                  style={[configStyles.input, errors.telefone && configStyles.inputError]}
                  value={formatTelefone(telefone ?? "")}
                  onChangeText={(value) => setTelefone(formatTelefone(value))}
                  placeholder="(00) 00000-0000"
                  keyboardType="phone-pad"
                  maxLength={15}
                />
                {errors.telefone && <Text style={configStyles.errorText}>{errors.telefone}</Text>}
              </View>

              {tipoUsuario === "Juridica" && (
                <View style={configStyles.inputGroup}>
                  <Text style={configStyles.label}>Nº Fornecedor:</Text>
                  <TextInput
                    style={[configStyles.input, configStyles.inputDisabled]}
                    value={fornecedorNum}
                    editable={false}
                  />
                </View>
              )}

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton, loadingSubmit && configStyles.buttonDisabled]}
                onPress={handleSubmitPerfil}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={configStyles.buttonText}>Salvar Perfil</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {activeTab === "endereco" && (
            <>
              <Text style={configStyles.sectionTitle}>Endereço de Entrega</Text>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>CEP:</Text>
                <View style={configStyles.rowContainer}>
                  <TextInput
                    style={[configStyles.input, configStyles.flexGrow, errors.cep && configStyles.inputError]}
                    value={formatCEP(cep ?? "")}
                    onChangeText={(value) => setCep(formatCEP(value))}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    keyboardType="numeric"
                    maxLength={9}
                  />
                  {loadingCep && (
                    <ActivityIndicator size="small" color="#4CAF50" style={configStyles.inputIcon} />
                  )}
                </View>
                {errors.cep && <Text style={configStyles.errorText}>{errors.cep}</Text>}
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Rua:</Text>
                <TextInput
                  style={[configStyles.input, errors.rua && configStyles.inputError]}
                  value={rua}
                  onChangeText={setRua}
                  placeholder="Nome da rua"
                />
                {errors.rua && <Text style={configStyles.errorText}>{errors.rua}</Text>}
              </View>

              <View style={configStyles.rowGroup}>
                <View style={[configStyles.inputGroup, configStyles.flex1, configStyles.marginRight]}>
                  <Text style={configStyles.label}>Número:</Text>
                  <TextInput
                    style={[configStyles.input, errors.numero && configStyles.inputError]}
                    value={numero}
                    onChangeText={setNumero}
                    keyboardType="numeric"
                    placeholder="Número"
                  />
                  {errors.numero && <Text style={configStyles.errorText}>{errors.numero}</Text>}
                </View>

                <View style={[configStyles.inputGroup, configStyles.flex2]}>
                  <Text style={configStyles.label}>Complemento:</Text>
                  <TextInput
                    style={configStyles.input}
                    value={complemento}
                    onChangeText={setComplemento}
                    placeholder="Apto, bloco, etc. (opcional)"
                  />
                </View>
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Bairro:</Text>
                <TextInput
                  style={[configStyles.input, errors.bairro && configStyles.inputError]}
                  value={bairro}
                  onChangeText={setBairro}
                  placeholder="Bairro"
                />
                {errors.bairro && <Text style={configStyles.errorText}>{errors.bairro}</Text>}
              </View>

              <View style={configStyles.rowGroup}>
                <View style={[configStyles.inputGroup, configStyles.flex2, configStyles.marginRight]}>
                  <Text style={configStyles.label}>Cidade:</Text>
                  <TextInput
                    style={[configStyles.input, errors.cidade && configStyles.inputError]}
                    value={cidade}
                    onChangeText={(value) => {
                      setCidade(value);
                      setCidadeId(null);
                    }}
                    placeholder="Cidade"
                  />
                  {errors.cidade && <Text style={configStyles.errorText}>{errors.cidade}</Text>}
                </View>

                <View style={[configStyles.inputGroup, configStyles.flex1]}>
                  <Text style={configStyles.label}>Estado:</Text>
                  <TextInput
                    style={[configStyles.input, errors.estado && configStyles.inputError]}
                    value={(estado ?? "").toUpperCase()}
                    onChangeText={(value) => {
                      setEstado(value.toUpperCase());
                      setCidadeId(null);
                    }}
                    placeholder="UF"
                    maxLength={2}
                  />
                  {errors.estado && <Text style={configStyles.errorText}>{errors.estado}</Text>}
                </View>
              </View>

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton, loadingSubmit && configStyles.buttonDisabled]}
                onPress={handleSubmitEndereco}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={configStyles.buttonText}>Salvar Endereço</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {activeTab === "notificacoes" && (
            <>
              <Text style={configStyles.sectionTitle}>Preferências de Notificação</Text>

              {[
                {
                  label: "Notificações por Email",
                  description: "Receba atualizações sobre seus pedidos por email",
                  value: emailNotificacoes,
                  onToggle: () => setEmailNotificacoes(!emailNotificacoes),
                },
                {
                  label: "Notificações por SMS",
                  description: "Receba atualizações sobre seus pedidos por SMS",
                  value: smsNotificacoes,
                  onToggle: () => setSmsNotificacoes(!smsNotificacoes),
                },
                {
                  label: "Marketing",
                  description: "Receba ofertas especiais e novidades",
                  value: marketingNotificacoes,
                  onToggle: () => setMarketingNotificacoes(!marketingNotificacoes),
                },
              ].map((item, index) => (
                <View key={item.label}>
                  <View style={configStyles.switchContainer}>
                    <View style={configStyles.switchInfo}>
                      <Text style={configStyles.switchLabel}>{item.label}</Text>
                      <Text style={configStyles.switchDescription}>{item.description}</Text>
                    </View>
                    <TouchableOpacity
                      style={[configStyles.switchButton, item.value && configStyles.switchButtonActive]}
                      onPress={item.onToggle}
                    >
                      <View
                        style={[configStyles.switchKnob, item.value && configStyles.switchKnobActive]}
                      />
                    </TouchableOpacity>
                  </View>
                  {index < 2 && <View style={configStyles.divider} />}
                </View>
              ))}

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton, loadingSubmit && configStyles.buttonDisabled]}
                onPress={handleSubmitNotificacoes}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={configStyles.buttonText}>Salvar Preferências</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {activeTab === "seguranca" && (
            <>
              <Text style={configStyles.sectionTitle}>Alterar Senha</Text>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Senha Atual:</Text>
                <TextInput
                  style={[configStyles.input, errors.senhaAtual && configStyles.inputError]}
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  placeholder="Sua senha atual"
                  secureTextEntry
                />
                {errors.senhaAtual && <Text style={configStyles.errorText}>{errors.senhaAtual}</Text>}
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Nova Senha:</Text>
                <TextInput
                  style={[configStyles.input, errors.novaSenha && configStyles.inputError]}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  placeholder="Nova senha"
                  secureTextEntry
                />
                {errors.novaSenha && <Text style={configStyles.errorText}>{errors.novaSenha}</Text>}
              </View>

              <View style={configStyles.inputGroup}>
                <Text style={configStyles.label}>Confirmar Nova Senha:</Text>
                <TextInput
                  style={[configStyles.input, errors.confirmarSenha && configStyles.inputError]}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  placeholder="Confirme a nova senha"
                  secureTextEntry
                />
                {errors.confirmarSenha && <Text style={configStyles.errorText}>{errors.confirmarSenha}</Text>}
              </View>

              <View style={configStyles.divider} />

              <Text style={configStyles.sectionTitle}>Segurança Adicional</Text>

              <View style={configStyles.switchContainer}>
                <View style={configStyles.switchInfo}>
                  <Text style={configStyles.switchLabel}>Autenticação de Dois Fatores</Text>
                  <Text style={configStyles.switchDescription}>
                    Adicione uma camada extra de segurança à sua conta
                  </Text>
                </View>
                <TouchableOpacity
                  style={[configStyles.switchButton, autenticacao2FA && configStyles.switchButtonActive]}
                  onPress={() => void handleToggleTwoFactor(!autenticacao2FA)}
                  disabled={loading2FA}
                >
                  <View style={[configStyles.switchKnob, autenticacao2FA && configStyles.switchKnobActive]} />
                </TouchableOpacity>
              </View>

              {loading2FA && (
                <View style={configStyles.inlineFeedback}>
                  <ActivityIndicator size="small" color="#4CAF50" />
                  <Text style={configStyles.feedbackText}>Atualizando autenticação...</Text>
                </View>
              )}

              {autenticacao2FA && !twoFASetupVisible && (
                <View style={configStyles.twoFactorStatusCard}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#2e7d32" />
                  <View style={configStyles.twoFactorStatusTextContainer}>
                    <Text style={configStyles.twoFactorStatusTitle}>2FA habilitado</Text>
                    <Text style={configStyles.twoFactorStatusDescription}>
                      Use o botão abaixo para configurar um novo dispositivo autenticador quando precisar.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={configStyles.secondaryButton}
                    onPress={() => void handleShowTwoFactorSetup()}
                    disabled={loading2FA}
                  >
                    <Text style={configStyles.secondaryButtonText}>Ver QR code</Text>
                  </TouchableOpacity>
                </View>
              )}

              {twoFASetupVisible && (
                <View style={configStyles.twoFactorContainer}>
                  <Text style={configStyles.twoFactorTitle}>Configurar aplicativo autenticador</Text>
                  <Text style={configStyles.twoFactorInstructions}>
                    {twoFASetupMode === "view"
                      ? "Escaneie novamente o QR code abaixo para registrar um novo dispositivo no seu aplicativo autenticador."
                      : "1. Abra o aplicativo Authenticator e escaneie o QR code abaixo."}
                  </Text>
                  {twoFAQRCode ? (
                    <Image source={{ uri: twoFAQRCode }} style={configStyles.qrCodeImage} />
                  ) : (
                    <ActivityIndicator size="large" color="#4CAF50" style={configStyles.twoFactorLoader} />
                  )}

                  {twoFASecret && (
                    <View style={configStyles.secretContainer}>
                      <Text style={configStyles.secretLabel}>Código manual:</Text>
                      <Text style={configStyles.secretValue}>{twoFASecret}</Text>
                    </View>
                  )}

                  <Text style={configStyles.twoFactorInstructions}>
                    {twoFASetupMode === "view"
                      ? "Digite um código recente para confirmar que o autenticador está sincronizado."
                      : "2. Digite o código de 6 dígitos gerado para finalizar a ativação."}
                  </Text>
                  <TextInput
                    style={[
                      configStyles.input,
                      configStyles.twoFactorCodeInput,
                      twoFAError && configStyles.inputError,
                    ]}
                    keyboardType="numeric"
                    value={twoFAValidationCode}
                    onChangeText={(value) => setTwoFAValidationCode(value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                  {twoFAError && <Text style={configStyles.errorText}>{twoFAError}</Text>}

                  <View style={configStyles.twoFactorButtons}>
                    <TouchableOpacity
                      style={[
                        configStyles.twoFactorCancelButton,
                        twoFASetupMode === "view" && configStyles.twoFactorCancelNeutral,
                        loading2FA && configStyles.twoFactorButtonDisabled,
                      ]}
                      onPress={() => {
                        if (twoFASetupMode === "view") {
                          closeTwoFactorSetup()
                        } else {
                          void handleToggleTwoFactor(false)
                        }
                      }}
                      disabled={loading2FA}
                    >
                      <Text
                        style={[
                          configStyles.twoFactorCancelText,
                          twoFASetupMode === "view" && configStyles.twoFactorCancelNeutralText,
                        ]}
                      >
                        {twoFASetupMode === "view" ? "Fechar" : "Cancelar"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        configStyles.twoFactorConfirmButton,
                        (loading2FA || twoFAValidationCode.length !== 6) &&
                          configStyles.twoFactorConfirmButtonDisabled,
                      ]}
                      onPress={handleConfirmTwoFactorCode}
                      disabled={loading2FA || twoFAValidationCode.length !== 6}
                    >
                      {loading2FA ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={configStyles.buttonText}>
                          {twoFASetupMode === "view" ? "Validar código" : "Confirmar código"}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[configStyles.button, configStyles.saveButton, loadingSubmit && configStyles.buttonDisabled]}
                onPress={handleSubmitSeguranca}
                disabled={loadingSubmit}
              >
                {loadingSubmit ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={configStyles.buttonText}>Atualizar Senha</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {activeTab === "pagamento" && (
            <>
              <Text style={configStyles.sectionTitle}>Métodos de Pagamento</Text>
              <Text style={configStyles.sectionDescription}>
                Cadastre, edite e defina o método padrão utilizado durante o checkout.
              </Text>

              <View style={configStyles.paymentSection}>
                <View style={configStyles.paymentSectionHeader}>
                  <Text style={configStyles.paymentSectionTitle}>
                    {isEditandoMetodoPagamento ? "Editar método de pagamento" : "Adicionar novo método"}
                  </Text>
                  {isEditandoMetodoPagamento && (
                    <TouchableOpacity
                      style={configStyles.paymentCancelEditButton}
                      onPress={cancelarEdicaoMetodoPagamento}
                      disabled={loadingSubmit}
                    >
                      <Ionicons name="close" size={16} color="#d32f2f" />
                      <Text style={configStyles.paymentCancelEditText}>Cancelar edição</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {metodoPagamentoEmEdicao && (
                  <Text style={configStyles.paymentEditingContext}>
                    Atualizando {metodoPagamentoEmEdicao.titulo} — alterações são aplicadas para futuras compras.
                  </Text>
                )}

                <Text style={configStyles.paymentInfoText}>
                  Selecione o tipo e preencha somente os campos exibidos para concluir o cadastro.
                </Text>

                <View style={configStyles.paymentTypeRow}>
                  {paymentTypeOptions.map((option) => {
                    const isActive = novoMetodoPagamento.tipo === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          configStyles.paymentTypeButton,
                          isActive && configStyles.paymentTypeButtonActive,
                        ]}
                        onPress={() => handleSelectPaymentType(option.value)}
                        disabled={loadingSubmit}
                      >
                        <Text
                          style={[
                            configStyles.paymentTypeButtonText,
                            isActive && configStyles.paymentTypeButtonTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {isCardPayment && (
                  <>
                    <View style={configStyles.inputGroup}>
                      <Text style={configStyles.label}>Número do cartão</Text>
                      <TextInput
                        style={[configStyles.input, errors.numero_cartao && configStyles.inputError]}
                        value={novoMetodoPagamento.numero_cartao}
                        onChangeText={handleChangeNumeroCartao}
                        placeholder="0000 0000 0000 0000"
                        keyboardType="numeric"
                        maxLength={19}
                      />
                      {errors.numero_cartao && <Text style={configStyles.errorText}>{errors.numero_cartao}</Text>}
                    </View>

                    <View style={configStyles.inputGroup}>
                      <Text style={configStyles.label}>Nome impresso no cartão</Text>
                      <TextInput
                        style={[configStyles.input, errors.nome_cartao && configStyles.inputError]}
                        value={novoMetodoPagamento.nome_cartao}
                        onChangeText={(value) => handleUpdatePaymentField("nome_cartao", value.toUpperCase())}
                        placeholder="NOME COMPLETO"
                        autoCapitalize="characters"
                      />
                      {errors.nome_cartao && <Text style={configStyles.errorText}>{errors.nome_cartao}</Text>}
                    </View>

                    <View style={configStyles.rowGroup}>
                      <View style={[configStyles.inputGroup, configStyles.flex1, configStyles.marginRight]}>
                        <Text style={configStyles.label}>Validade (MM/AA)</Text>
                        <TextInput
                          style={[configStyles.input, errors.data_validade && configStyles.inputError]}
                          value={novoMetodoPagamento.data_validade}
                          onChangeText={handleChangeDataValidade}
                          placeholder="MM/AA"
                          keyboardType="numeric"
                          maxLength={5}
                        />
                        {errors.data_validade && <Text style={configStyles.errorText}>{errors.data_validade}</Text>}
                      </View>

                      <View style={[configStyles.inputGroup, configStyles.flex1]}>
                        <Text style={configStyles.label}>CVV</Text>
                        <TextInput
                          style={[configStyles.input, errors.cvv && configStyles.inputError]}
                          value={novoMetodoPagamento.cvv}
                          onChangeText={handleChangeCVV}
                          placeholder="000"
                          keyboardType="numeric"
                          maxLength={4}
                          secureTextEntry
                        />
                        {errors.cvv && <Text style={configStyles.errorText}>{errors.cvv}</Text>}
                      </View>
                    </View>
                  </>
                )}

                {isPixPayment && (
                  <View style={configStyles.inputGroup}>
                    <Text style={configStyles.label}>Chave PIX</Text>
                    <TextInput
                      style={[configStyles.input, errors.chave_pix && configStyles.inputError]}
                      value={novoMetodoPagamento.chave_pix}
                      onChangeText={(value) => handleUpdatePaymentField("chave_pix", value.trim())}
                      placeholder="Informe a chave PIX"
                      autoCapitalize="none"
                    />
                    {errors.chave_pix && <Text style={configStyles.errorText}>{errors.chave_pix}</Text>}
                  </View>
                )}

                {isPaypalPayment && (
                  <View style={configStyles.inputGroup}>
                    <Text style={configStyles.label}>Email PayPal</Text>
                    <TextInput
                      style={[configStyles.input, errors.email_paypal && configStyles.inputError]}
                      value={novoMetodoPagamento.email_paypal}
                      onChangeText={(value) => handleUpdatePaymentField("email_paypal", value.trim())}
                      placeholder="seuemail@paypal.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {errors.email_paypal && <Text style={configStyles.errorText}>{errors.email_paypal}</Text>}
                  </View>
                )}

                {isBoletoPayment && (
                  <Text style={configStyles.paymentInfoText}>
                    Nenhum dado adicional é necessário para boletos. Apenas confirme para habilitar este método.
                  </Text>
                )}

                <View style={configStyles.paymentFormActions}>
                  <TouchableOpacity
                    style={[
                      configStyles.button,
                      configStyles.saveButton,
                      loadingSubmit && configStyles.buttonDisabled,
                    ]}
                    onPress={handleAdicionarMetodoPagamento}
                    disabled={loadingSubmit}
                  >
                    {loadingSubmit ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={configStyles.buttonText}>
                        {isEditandoMetodoPagamento ? "Salvar alterações" : "Adicionar método"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {metodosPagamento.length === 0 ? (
                <View style={configStyles.paymentCard}>
                  <Text style={configStyles.paymentCardTitle}>Nenhum método cadastrado.</Text>
                  <Text style={configStyles.paymentCardDetail}>
                    Utilize o formulário acima para incluir seu primeiro método de pagamento.
                  </Text>
                </View>
              ) : (
                <View style={configStyles.paymentList}>
                  {metodosPagamento.map((metodo) => {
                    const isEditing = metodoPagamentoEmEdicao?.id === metodo.id;
                    return (
                      <View
                        key={metodo.id}
                        style={[
                          configStyles.paymentCard,
                          isEditing && configStyles.paymentCardEditing,
                        ]}
                      >
                        <View style={configStyles.paymentCardInfo}>
                          <View style={configStyles.paymentCardIcon}>
                            <Ionicons
                              name={metodo.tipo === "pix" ? "flash-outline" : "card-outline"}
                              size={24}
                              color="#4CAF50"
                            />
                          </View>
                          <View style={configStyles.paymentCardText}>
                            <Text style={configStyles.paymentCardTitle}>{metodo.titulo}</Text>
                            <Text style={configStyles.paymentCardDetail}>{metodo.detalhe}</Text>
                            {metodo.principal && (
                              <Text style={configStyles.paymentBadge}>Padrão</Text>
                            )}
                            {isEditing && (
                              <Text style={[configStyles.paymentBadge, configStyles.paymentBadgeEditing]}>
                                Editando
                              </Text>
                            )}
                          </View>
                        </View>

                        <View style={configStyles.paymentCardActions}>
                          <TouchableOpacity
                            style={[configStyles.paymentActionButton, loadingSubmit && configStyles.paymentActionButtonDisabled]}
                            onPress={() => iniciarEdicaoMetodoPagamento(metodo)}
                            disabled={loadingSubmit}
                          >
                            <Text style={configStyles.paymentActionButtonText}>Editar</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              configStyles.paymentActionButton,
                              configStyles.paymentActionButtonPrimary,
                              (metodo.principal || loadingSubmit) && configStyles.paymentActionButtonDisabled,
                            ]}
                            onPress={() => handleDefinirMetodoPagamentoPadrao(metodo.id)}
                            disabled={metodo.principal || loadingSubmit}
                          >
                            <Text
                              style={[
                                configStyles.paymentActionButtonText,
                                configStyles.paymentActionButtonPrimaryText,
                              ]}
                            >
                              Definir padrão
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              configStyles.paymentActionButton,
                              configStyles.paymentActionButtonDanger,
                              loadingSubmit && configStyles.paymentActionButtonDisabled,
                            ]}
                            onPress={() => handleRemoverMetodoPagamento(metodo.id)}
                            disabled={loadingSubmit}
                          >
                            <Text
                              style={[
                                configStyles.paymentActionButtonText,
                                configStyles.paymentActionButtonDangerText,
                              ]}
                            >
                              Remover
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {activeTab === "fornecedor" && canManageFornecedorTab && (
            <>
              <Text style={configStyles.sectionTitle}>Configuração de Parcelamento</Text>
              <Text style={configStyles.sectionDescription}>
                {tipoUsuario === "Admin"
                  ? "Selecione um fornecedor e ajuste como os clientes podem parcelar compras feitas com ele."
                  : "Defina limites de parcelas, isenção de juros e valores mínimos para seus clientes durante o checkout."}
              </Text>

              {tipoUsuario === "Admin" && !adminFornecedorSelecionado && fornecedorConfigError && (
                <Text style={configStyles.errorText}>{fornecedorConfigError}</Text>
              )}

              {tipoUsuario === "Admin" && (
                <View style={configStyles.inputGroup}>
                  <Text style={configStyles.label}>Buscar fornecedor</Text>
                  <TextInput
                    style={configStyles.input}
                    placeholder="Nome ou número do fornecedor"
                    value={adminFornecedorSearch}
                    onChangeText={setAdminFornecedorSearch}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    style={[configStyles.button, configStyles.saveButton, { marginTop: 10 }]}
                    onPress={() => fetchAdminFornecedores(adminFornecedorSearch)}
                    disabled={adminFornecedorLoading}
                  >
                    {adminFornecedorLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={configStyles.buttonText}>Buscar fornecedores</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {tipoUsuario === "Admin" && (
                <View style={{ marginTop: 10 }}>
                  {adminFornecedorLoading ? (
                    <ActivityIndicator size="small" color="#4CAF50" />
                  ) : adminFornecedores.length === 0 ? (
                    <Text style={configStyles.paymentInfoText}>
                      Nenhum fornecedor encontrado para os filtros aplicados.
                    </Text>
                  ) : (
                    adminFornecedores.map((fornecedor) => (
                      <TouchableOpacity
                        key={fornecedor.pessoa_id}
                        style={[
                          configStyles.paymentCard,
                          adminFornecedorSelecionado?.pessoa_id === fornecedor.pessoa_id && {
                            borderColor: "#4CAF50",
                            backgroundColor: "#f3fbf5",
                          },
                        ]}
                        onPress={() => handleSelectAdminFornecedor(fornecedor)}
                      >
                        <Text style={configStyles.paymentCardTitle}>{fornecedor.pessoa_nome}</Text>
                        <Text style={configStyles.paymentCardDetail}>
                          ID #{fornecedor.pessoa_id}
                          {fornecedor.pessoa_num_fornecedor ? ` • Nº fornecedor ${fornecedor.pessoa_num_fornecedor}` : ""}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {(tipoUsuario === "Juridica" || adminFornecedorSelecionado) && (
                <View style={{ marginTop: 10 }}>
                  {fornecedorConfigLoading ? (
                    <ActivityIndicator size="large" color="#4CAF50" />
                  ) : (
                    <>
                      {fornecedorAtualizadoEm && (
                        <Text style={configStyles.paymentInfoText}>
                          Última atualização: {fornecedorAtualizadoEm}
                        </Text>
                      )}

                      {fornecedorConfigError && (
                        <Text style={configStyles.errorText}>{fornecedorConfigError}</Text>
                      )}

                      {fornecedorConfigMessage && (
                        <Text style={configStyles.successText}>{fornecedorConfigMessage}</Text>
                      )}

                      <View style={configStyles.inputGroup}>
                        <Text style={configStyles.label}>Máximo de parcelas</Text>
                        <TextInput
                          style={[
                            configStyles.input,
                            fornecedorFormErrors.maxParcelas && configStyles.inputError,
                          ]}
                          keyboardType="numeric"
                          value={fornecedorForm.maxParcelas}
                          onChangeText={(value) =>
                            handleFornecedorFieldChange("maxParcelas", value.replace(/[^0-9]/g, ""))
                          }
                          placeholder="Ex.: 6"
                        />
                        {fornecedorFormErrors.maxParcelas && (
                          <Text style={configStyles.errorText}>{fornecedorFormErrors.maxParcelas}</Text>
                        )}
                      </View>

                      <View style={configStyles.inputGroup}>
                        <Text style={configStyles.label}>Parcelas sem juros</Text>
                        <TextInput
                          style={[
                            configStyles.input,
                            fornecedorFormErrors.parcelasSemJuros && configStyles.inputError,
                          ]}
                          keyboardType="numeric"
                          value={fornecedorForm.parcelasSemJuros}
                          onChangeText={(value) =>
                            handleFornecedorFieldChange("parcelasSemJuros", value.replace(/[^0-9]/g, ""))
                          }
                          placeholder="Ex.: 2"
                        />
                        {fornecedorFormErrors.parcelasSemJuros && (
                          <Text style={configStyles.errorText}>{fornecedorFormErrors.parcelasSemJuros}</Text>
                        )}
                      </View>

                      <View style={configStyles.inputGroup}>
                        <Text style={configStyles.label}>Valor mínimo por parcela (opcional)</Text>
                        <TextInput
                          style={[
                            configStyles.input,
                            fornecedorFormErrors.valorMinParcela && configStyles.inputError,
                          ]}
                          keyboardType="decimal-pad"
                          value={fornecedorForm.valorMinParcela}
                          onChangeText={(value) =>
                            handleFornecedorFieldChange(
                              "valorMinParcela",
                              value.replace(/[^0-9.,]/g, "").replace(",", "."),
                            )
                          }
                          placeholder="Ex.: 50.00"
                        />
                        {fornecedorFormErrors.valorMinParcela && (
                          <Text style={configStyles.errorText}>{fornecedorFormErrors.valorMinParcela}</Text>
                        )}
                      </View>

                      <View style={configStyles.inputGroup}>
                        <Text style={configStyles.label}>Juros (%) após o limite sem juros</Text>
                        <TextInput
                          style={[
                            configStyles.input,
                            fornecedorFormErrors.jurosPercentual && configStyles.inputError,
                          ]}
                          keyboardType="decimal-pad"
                          value={fornecedorForm.jurosPercentual}
                          onChangeText={(value) =>
                            handleFornecedorFieldChange(
                              "jurosPercentual",
                              value.replace(/[^0-9.,]/g, "").replace(",", "."),
                            )
                          }
                          placeholder="Ex.: 1.99"
                        />
                        {fornecedorFormErrors.jurosPercentual && (
                          <Text style={configStyles.errorText}>{fornecedorFormErrors.jurosPercentual}</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        style={[
                          configStyles.button,
                          configStyles.saveButton,
                          (fornecedorConfigSaving || fornecedorConfigLoading) && configStyles.buttonDisabled,
                        ]}
                        onPress={handleSubmitFornecedorConfig}
                        disabled={fornecedorConfigSaving || fornecedorConfigLoading}
                      >
                        {fornecedorConfigSaving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={configStyles.buttonText}>Salvar configurações</Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}

              {tipoUsuario === "Admin" && !adminFornecedorSelecionado && (
                <Text style={[configStyles.paymentInfoText, { marginTop: 15 }]}>
                  Escolha um fornecedor acima para liberar a edição das configurações.
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const ConfigScreen: React.FC = () => (
  <ConfigProvider>
    <ConfigScreenContent />
  </ConfigProvider>
);

export default ConfigScreen;
