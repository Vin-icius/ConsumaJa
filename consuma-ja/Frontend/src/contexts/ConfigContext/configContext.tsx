import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, Keyboard } from 'react-native';
import pessoaService from '../../services/pessoaService';
import locationService from '../../services/locationService';
import configService from '../../services/configService';
import { useApplication } from '../ApplicationContext/ApplicationContext';

type PessoaTipo = 'Fisica' | 'Juridica' | 'Admin' | '';
type TabType = 'perfil' | 'endereco' | 'notificacoes' | 'seguranca' | 'pagamento' | 'fornecedor';

type MetodoPagamentoTipo = 'cartao_credito' | 'cartao_debito' | 'pix' | 'paypal' | 'boleto';

type NovoMetodoPagamento = {
  tipo: MetodoPagamentoTipo;
  numero_cartao: string;
  nome_cartao: string;
  data_validade: string;
  cvv: string;
  chave_pix: string;
  email_paypal: string;
};

type MetodoPagamentoResumo = {
  id: number;
  tipo: MetodoPagamentoTipo;
  titulo: string;
  detalhe: string;
  principal: boolean;
  numero_final: string | null;
  nome_cartao: string | null;
  data_validade: string | null;
  pix_chave: string | null;
  email_paypal: string | null;
};

const createMetodoPagamentoFromTipo = (tipo: MetodoPagamentoTipo): NovoMetodoPagamento => ({
  tipo,
  numero_cartao: '',
  nome_cartao: '',
  data_validade: '',
  cvv: '',
  chave_pix: '',
  email_paypal: '',
});

const createDefaultMetodoPagamento = (): NovoMetodoPagamento => createMetodoPagamentoFromTipo('cartao_credito');

type TwoFASetupMode = 'enable' | 'view' | null;

type ConfigContextValue = {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  nome: string;
  setNome: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  telefone: string;
  setTelefone: (value: string) => void;
  tipoUsuario: PessoaTipo;
  setTipoUsuario: (value: PessoaTipo) => void;
  cpf: string;
  setCpf: (value: string) => void;
  cnpj: string;
  setCnpj: (value: string) => void;
  fornecedorNum: string;
  setFornecedorNum: (value: string) => void;

  cep: string;
  setCep: (value: string) => void;
  rua: string;
  setRua: (value: string) => void;
  numero: string;
  setNumero: (value: string) => void;
  complemento: string;
  setComplemento: (value: string) => void;
  bairro: string;
  setBairro: (value: string) => void;
  cidade: string;
  setCidade: (value: string) => void;
  estado: string;
  setEstado: (value: string) => void;
  cidadeId: number | null;
  setCidadeId: (value: number | null) => void;

  senhaAtual: string;
  setSenhaAtual: (value: string) => void;
  novaSenha: string;
  setNovaSenha: (value: string) => void;
  confirmarSenha: string;
  setConfirmarSenha: (value: string) => void;
  autenticacao2FA: boolean;
  setAutenticacao2FA: (value: boolean) => void;
  loading2FA: boolean;
  twoFASetupVisible: boolean;
  twoFAQRCode: string | null;
  twoFASecret: string | null;
  twoFAValidationCode: string;
  setTwoFAValidationCode: (value: string) => void;
  twoFAError: string | null;
  twoFASetupMode: TwoFASetupMode;
  handleToggleTwoFactor: (enabled: boolean) => Promise<void>;
  handleConfirmTwoFactorCode: () => Promise<void>;
  handleShowTwoFactorSetup: () => Promise<void>;
  closeTwoFactorSetup: () => void;

  emailNotificacoes: boolean;
  setEmailNotificacoes: (value: boolean) => void;
  smsNotificacoes: boolean;
  setSmsNotificacoes: (value: boolean) => void;
  marketingNotificacoes: boolean;
  setMarketingNotificacoes: (value: boolean) => void;

  metodosPagamento: MetodoPagamentoResumo[];
  novoMetodoPagamento: NovoMetodoPagamento;
  setNovoMetodoPagamento: (value: NovoMetodoPagamento) => void;
  metodoPagamentoEmEdicao: MetodoPagamentoResumo | null;
  iniciarEdicaoMetodoPagamento: (metodo: MetodoPagamentoResumo) => void;
  cancelarEdicaoMetodoPagamento: () => void;
  isEditandoMetodoPagamento: boolean;

  loadingData: boolean;
  loadingSubmit: boolean;
  setLoadingSubmit: (value: boolean) => void;
  loadingCep: boolean;
  errors: Record<string, string>;
  setErrors: (value: Record<string, string>) => void;
  currentUserId: number | null;

  handleCepBlur: () => Promise<void>;
  handleSubmitPerfil: () => Promise<void>;
  handleSubmitEndereco: () => Promise<void>;
  handleSubmitNotificacoes: () => Promise<void>;
  handleSubmitSeguranca: () => Promise<void>;
  handleAdicionarMetodoPagamento: () => Promise<void>;
  handleRemoverMetodoPagamento: (pagamentoId: number) => Promise<void>;
  handleDefinirMetodoPagamentoPadrao: (pagamentoId: number) => Promise<void>;
  refreshMetodosPagamento: () => Promise<void>;

  validarPerfil: () => boolean;
  validarEndereco: () => boolean;
  validarSeguranca: () => boolean;
  validarMetodoPagamento: () => boolean;
  clearErrors: () => void;

  handleUpdateNomeDocumento: (nome: string, documento: string) => Promise<void>;
  handleUpdatePerfilCompleto: (nome: string, email: string, telefone: string) => Promise<void>;
  loadUserData: () => Promise<void>;
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: applicationUser, validateActiveSession, setUserData } = useApplication();
  const applicationUserId = applicationUser?.pessoa_id ?? applicationUser?.id ?? null;
  const [activeTab, setActiveTab] = useState<TabType>('perfil');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<PessoaTipo>('Fisica');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [fornecedorNum, setFornecedorNum] = useState('');

  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cidadeId, setCidadeId] = useState<number | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [autenticacao2FA, setAutenticacao2FA] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [twoFASetupVisible, setTwoFASetupVisible] = useState(false);
  const [twoFAQRCode, setTwoFAQRCode] = useState<string | null>(null);
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [twoFAValidationCode, setTwoFAValidationCode] = useState('');
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [twoFASetupMode, setTwoFASetupMode] = useState<TwoFASetupMode>(null);

  const [emailNotificacoes, setEmailNotificacoes] = useState(true);
  const [smsNotificacoes, setSmsNotificacoes] = useState(false);
  const [marketingNotificacoes, setMarketingNotificacoes] = useState(true);

  const [metodosPagamento, setMetodosPagamento] = useState<MetodoPagamentoResumo[]>([]);
  const [novoMetodoPagamento, setNovoMetodoPagamento] = useState<NovoMetodoPagamento>(createDefaultMetodoPagamento);
  const [metodoPagamentoEmEdicao, setMetodoPagamentoEmEdicao] = useState<MetodoPagamentoResumo | null>(null);

  const [loadingData, setLoadingData] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const normalizeQrCodeResponse = useCallback((payload: any): string | null => {
    if (!payload) {
      return null;
    }

    if (typeof payload === 'string') {
      return payload;
    }

    if (typeof payload === 'object') {
      if (payload.qr_code) {
        return String(payload.qr_code);
      }

      if (payload.qrCode) {
        return String(payload.qrCode);
      }
    }

    return null;
  }, []);

  const resetTwoFactorTransientState = useCallback(() => {
    setTwoFASetupVisible(false);
    setTwoFAQRCode(null);
    setTwoFAValidationCode('');
    setTwoFAError(null);
  }, []);

  const handleTwoFACodeInput = useCallback(
    (value: string) => {
      setTwoFAValidationCode(value);
      if (twoFAError) {
        setTwoFAError(null);
      }
    },
    [twoFAError],
  );

  const closeTwoFactorSetup = useCallback(() => {
    resetTwoFactorTransientState();
    setTwoFASetupMode(null);
    setTwoFASecret(null);
  }, [resetTwoFactorTransientState]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const validarPerfil = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!email.includes('@')) newErrors.email = 'Email inválido';
    if (!telefone || telefone.replace(/\D/g, '').length < 10) newErrors.telefone = 'Telefone inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [nome, email, telefone]);

  const validarEndereco = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cep || cep.replace(/\D/g, '').length !== 8) newErrors.cep = 'CEP inválido';
    if (!rua.trim()) newErrors.rua = 'Rua é obrigatória';
    if (!numero.trim()) newErrors.numero = 'Número é obrigatório';
    if (!bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
    if (!cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
    if (!estado.trim()) newErrors.estado = 'Estado é obrigatório';
    if (!cidadeId) newErrors.cidade = 'Confirme o CEP para vincular a cidade correta';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cep, rua, numero, bairro, cidade, estado, cidadeId]);

  const validarSeguranca = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!senhaAtual) newErrors.senhaAtual = 'Senha atual é obrigatória';
    if (!novaSenha) newErrors.novaSenha = 'Nova senha é obrigatória';
    if (novaSenha.length < 6) newErrors.novaSenha = 'A nova senha deve ter pelo menos 6 caracteres';
    if (novaSenha !== confirmarSenha) newErrors.confirmarSenha = 'As senhas não coincidem';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [senhaAtual, novaSenha, confirmarSenha]);

  const refreshMetodosPagamento = useCallback(async () => {
    if (!currentUserId) {
      return;
    }

    try {
      const metodos = await configService.listarMetodosPagamento(currentUserId);
      setMetodosPagamento(Array.isArray(metodos) ? metodos : []);
    } catch (error) {
      console.error('[ConfigContext] Erro ao atualizar métodos de pagamento:', error);
    }
  }, [currentUserId]);

  const validarMetodoPagamento = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const tipo = novoMetodoPagamento.tipo;

    if (tipo === 'cartao_credito' || tipo === 'cartao_debito') {
      const numeroSanitizado = novoMetodoPagamento.numero_cartao.replace(/\D/g, '');
      if (numeroSanitizado.length < 13 || numeroSanitizado.length > 19) {
        newErrors.numero_cartao = 'Número do cartão inválido';
      }
      if (!novoMetodoPagamento.nome_cartao.trim()) {
        newErrors.nome_cartao = 'Nome impresso no cartão é obrigatório';
      }
      if (!/^\d{2}\/\d{2}$/.test(novoMetodoPagamento.data_validade.trim())) {
        newErrors.data_validade = 'Use o formato MM/AA';
      }
      const cvvSanitizado = novoMetodoPagamento.cvv.replace(/\D/g, '');
      if (cvvSanitizado.length < 3 || cvvSanitizado.length > 4) {
        newErrors.cvv = 'CVV inválido';
      }
    } else if (tipo === 'pix') {
      if (!novoMetodoPagamento.chave_pix.trim()) {
        newErrors.chave_pix = 'Informe a chave PIX';
      }
    } else if (tipo === 'paypal') {
      if (!novoMetodoPagamento.email_paypal.trim()) {
        newErrors.email_paypal = 'Informe o email da conta PayPal';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [novoMetodoPagamento]);

  const loadUserData = useCallback(async () => {
    setLoadingData(true);
    setErrors({});

    try {
      let userId = applicationUserId;

      if (!userId) {
        const sessionUser = await validateActiveSession();
        userId = sessionUser?.pessoa_id ?? sessionUser?.id ?? null;
      }

      if (!userId) {
        setErrors({ form: 'Usuário não autenticado. Faça login novamente.' });
        setLoadingData(false);
        return;
      }

      setCurrentUserId(userId);

      const userData = await pessoaService.buscarPessoaPorId(userId);

      setUserData({
        pessoa_id: userData.pessoa_id,
        pessoa_nome: userData.pessoa_nome,
        pessoa_email: userData.pessoa_email,
        pessoa_tipo: userData.pessoa_tipo,
        documento: userData.documento ?? userData.pessoa_cpf ?? userData.pessoa_cnpj ?? null,
        pessoa_cpf: userData.pessoa_cpf ?? null,
        pessoa_cnpj: userData.pessoa_cnpj ?? null,
        pessoa_num_fornecedor: userData.pessoa_num_fornecedor ?? null,
        endereco: userData.endereco ?? null,
      });

      let configData: any = null;
      try {
        configData = await configService.getConfiguracoesUsuario(userId);
      } catch (configError) {
        console.warn('[ConfigContext] Falha ao carregar configurações:', configError);
        configData = {
          notificacoes: {
            email_notificacoes: true,
            sms_notificacoes: false,
            marketing_notificacoes: true,
            push_notificacoes: true,
          },
          metodos_pagamento: [],
          autenticacao_2fa: false,
        };
      }

      setNome(userData.pessoa_nome ?? '');
      setEmail(userData.pessoa_email ?? '');
      setTelefone(userData.pessoa_telefone ?? '');
      setTipoUsuario((userData.pessoa_tipo as PessoaTipo) ?? 'Fisica');

      if (userData.pessoa_tipo === 'Fisica') {
        setCpf((userData.pessoa_cpf ?? userData.documento ?? '').toString());
        setCnpj('');
      } else if (userData.pessoa_tipo === 'Juridica') {
        setCnpj((userData.pessoa_cnpj ?? userData.documento ?? '').toString());
        setFornecedorNum(userData.pessoa_num_fornecedor?.toString() ?? '');
        setCpf('');
      } else {
        setCpf('');
        setCnpj('');
      }

      if (userData.endereco) {
        const endereco = userData.endereco;
        setCep(endereco.endereco_cep ?? '');
        setRua(endereco.endereco_rua ?? '');
        setNumero(endereco.endereco_numero ?? '');
        setComplemento(endereco.endereco_complemento ?? '');
        setBairro(endereco.endereco_bairro ?? '');

        if (endereco.cidade_id !== undefined && endereco.cidade_id !== null) {
          setCidadeId(Number(endereco.cidade_id));
        } else {
          setCidadeId(null);
        }

        if (endereco.cidade_nome) {
          setCidade(endereco.cidade_nome);
        }

        if (endereco.estado_sigla || endereco.estado_nome) {
          setEstado((endereco.estado_sigla ?? endereco.estado_nome ?? '').toString());
        }

        if ((!endereco.cidade_nome || !endereco.estado_sigla) && endereco.cidade_id) {
          try {
            const cidadeData = await locationService.getCidadeById(endereco.cidade_id);
            setCidade((cidadeData.cidade_nome ?? '').toString());
            if (cidadeData.estado_id) {
              const estadoData = await locationService.getEstadoById(cidadeData.estado_id);
              setEstado((estadoData.estado_sigla ?? estadoData.estado_nome ?? '').toString());
            }
          } catch (cidadeError) {
            console.warn('[ConfigContext] Falha ao buscar dados da cidade:', cidadeError);
          }
        }
      } else {
        setCep('');
        setRua('');
        setNumero('');
        setComplemento('');
        setBairro('');
        setCidade('');
        setEstado('');
        setCidadeId(null);
      }

      if (configData?.notificacoes) {
        setEmailNotificacoes(configData.notificacoes.email_notificacoes ?? true);
        setSmsNotificacoes(configData.notificacoes.sms_notificacoes ?? false);
        setMarketingNotificacoes(configData.notificacoes.marketing_notificacoes ?? true);
      }

      if (Array.isArray(configData?.metodos_pagamento)) {
        setMetodosPagamento(configData.metodos_pagamento as MetodoPagamentoResumo[]);
      } else {
        setMetodosPagamento([]);
      }

      setMetodoPagamentoEmEdicao(null);
      setNovoMetodoPagamento(createDefaultMetodoPagamento());

      if (configData?.autenticacao_2fa !== undefined) {
        setAutenticacao2FA(Boolean(configData.autenticacao_2fa));
      }

      setTwoFASecret(null);
      resetTwoFactorTransientState();
    setTwoFASetupMode(null);

      setLoadingData(false);
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao carregar usuário:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Erro ao carregar dados do usuário.';
      setErrors({ form: errorMessage });
      setLoadingData(false);
    }
  }, [applicationUserId, validateActiveSession, setUserData, resetTwoFactorTransientState]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleCepBlur = useCallback(async () => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (!cepLimpo || cepLimpo.length !== 8) {
      return;
    }

    Keyboard.dismiss();
    setLoadingCep(true);
    setErrors((prev) => {
      const { cep: cepError, rua: ruaError, bairro: bairroError, cidade: cidadeError, estado: estadoError, ...rest } = prev;
      return rest;
    });

    try {
      const addressData = await locationService.lookupCep(cepLimpo);
      setRua(addressData.logradouro ?? '');
      setBairro(addressData.bairro ?? '');
      setCidade(addressData.cidade ?? addressData.localidade ?? '');
      const estadoFromService = addressData.estado ?? addressData.uf ?? '';
      setEstado(estadoFromService.toUpperCase());
      setCidadeId(
        typeof addressData.cidadeId === 'number'
          ? addressData.cidadeId
          : typeof addressData.cidade_id === 'number'
          ? addressData.cidade_id
          : null,
      );
    } catch (error) {
      console.error('[ConfigContext] Erro ao consultar CEP:', error);
      setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado ou inválido' }));
    } finally {
      setLoadingCep(false);
    }
  }, [cep]);

  const handleSubmitPerfil = useCallback(async () => {
    Keyboard.dismiss();

    if (!validarPerfil() || !currentUserId) {
      Alert.alert('Erro', 'Verifique os campos do perfil.');
      return;
    }

    setLoadingSubmit(true);

    try {
      await pessoaService.atualizarPessoa(currentUserId, {
        pessoa_email: email,
        pessoa_telefone: telefone,
      });

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao atualizar perfil:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Não foi possível atualizar o perfil.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  }, [validarPerfil, currentUserId, email, telefone]);

  const handleSubmitEndereco = useCallback(async () => {
    Keyboard.dismiss();

    if (!validarEndereco() || !currentUserId) {
      Alert.alert('Erro', 'Verifique os campos do endereço.');
      return;
    }

    setLoadingSubmit(true);

    if (!cidadeId) {
      setErrors((prev) => ({ ...prev, cidade: 'Use o CEP para localizar uma cidade válida.' }));
      setLoadingSubmit(false);
      Alert.alert('Erro', 'Não foi possível identificar a cidade. Revise o CEP informado.');
      return;
    }

    try {
      await pessoaService.atualizarPessoa(currentUserId, {
        endereco: {
          endereco_cep: cep.replace(/\D/g, ''),
          endereco_rua: rua,
          endereco_numero: numero,
          endereco_complemento: complemento || null,
          endereco_bairro: bairro,
          cidade_id: cidadeId,
        },
      });

      Alert.alert('Sucesso', 'Endereço atualizado com sucesso!');
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao atualizar endereço:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Não foi possível atualizar o endereço.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  }, [validarEndereco, currentUserId, cep, rua, numero, complemento, bairro, cidadeId]);

  const handleSubmitNotificacoes = useCallback(async () => {
    if (!currentUserId) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    setLoadingSubmit(true);

    try {
      await configService.atualizarNotificacoes(currentUserId, {
        email_notificacoes: emailNotificacoes,
        sms_notificacoes: smsNotificacoes,
        marketing_notificacoes: marketingNotificacoes,
        push_notificacoes: true,
      });

      Alert.alert('Sucesso', 'Preferências de notificação atualizadas!');
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao atualizar notificações:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Não foi possível atualizar as preferências.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  }, [currentUserId, emailNotificacoes, smsNotificacoes, marketingNotificacoes]);

  const handleToggleTwoFactor = useCallback(
    async (enabled: boolean) => {
      if (!currentUserId) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        return;
      }

      const previousState = autenticacao2FA;
      setLoading2FA(true);
      setTwoFAError(null);

      try {
        if (enabled) {
          const configuracao = await configService.atualizarConfiguracao2FA(currentUserId, true);
          const qrResponse = await configService.gerarQRCode2FA(currentUserId);
          const qrCodeValue = normalizeQrCodeResponse(qrResponse);

          if (!qrCodeValue) {
            throw new Error('Não foi possível gerar o QR code para autenticação.');
          }

          setAutenticacao2FA(true);
          setTwoFASecret(configuracao?.codigo_2fa ?? null);
          setTwoFAQRCode(qrCodeValue);
          setTwoFASetupVisible(true);
          setTwoFAValidationCode('');
          setTwoFASetupMode('enable');
          Alert.alert('Quase lá', 'Escaneie o QR code e confirme o código para concluir a ativação.');
        } else {
          await configService.atualizarConfiguracao2FA(currentUserId, false);
          setAutenticacao2FA(false);
          resetTwoFactorTransientState();
          setTwoFASecret(null);
          setTwoFASetupMode(null);
          Alert.alert('Sucesso', 'Autenticação de dois fatores desativada.');
          setUserData({ two_fa: false });
        }
      } catch (error: any) {
        console.error('[ConfigContext] Erro ao atualizar 2FA:', error);
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Não foi possível atualizar a autenticação de dois fatores.';

        Alert.alert('Erro', message);
        setAutenticacao2FA(previousState);
        if (!previousState) {
          resetTwoFactorTransientState();
          setTwoFASecret(null);
        }
        setTwoFASetupMode(previousState ? 'view' : null);
      } finally {
        setLoading2FA(false);
      }
    },
    [autenticacao2FA, currentUserId, normalizeQrCodeResponse, resetTwoFactorTransientState, setUserData],
  );

  const handleConfirmTwoFactorCode = useCallback(async () => {
    if (!currentUserId) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    const sanitizedCode = twoFAValidationCode.replace(/\D/g, '');

    if (sanitizedCode.length !== 6) {
      setTwoFAError('Informe o código de 6 dígitos.');
      return;
    }

    setLoading2FA(true);
    setTwoFAError(null);

    try {
      const validation = await configService.validarCodigo2FA(currentUserId, sanitizedCode);

      if (!validation?.valido) {
        setTwoFAError('Código inválido. Tente novamente.');
        return;
      }

      setAutenticacao2FA(true);
      setUserData({ two_fa: true });
      Alert.alert('Sucesso', 'Autenticação de dois fatores ativada!');
      resetTwoFactorTransientState();
      setTwoFAQRCode(null);
      setTwoFAValidationCode('');
      setTwoFASetupMode(null);
      setTwoFASecret(null);
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao validar código 2FA:', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Falha ao validar o código 2FA.';
      setTwoFAError(message);
    } finally {
      setLoading2FA(false);
    }
  }, [currentUserId, twoFAValidationCode, resetTwoFactorTransientState, setUserData]);

  const handleShowTwoFactorSetup = useCallback(async () => {
    if (!currentUserId) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    setLoading2FA(true);
    setTwoFAError(null);

    try {
      const qrResponse = await configService.gerarQRCode2FA(currentUserId);
      const qrCodeValue = normalizeQrCodeResponse(qrResponse);

      if (!qrCodeValue) {
        throw new Error('Não foi possível carregar o QR code.');
      }

      setTwoFAQRCode(qrCodeValue);
      setTwoFASetupVisible(true);
      setTwoFAValidationCode('');
      setTwoFASetupMode('view');
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao carregar QR 2FA:', error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Não foi possível carregar o QR code.';
      Alert.alert('Erro', message);
    } finally {
      setLoading2FA(false);
    }
  }, [currentUserId, normalizeQrCodeResponse]);

  const handleSubmitSeguranca = useCallback(async () => {
    Keyboard.dismiss();

    if (!validarSeguranca() || !currentUserId) {
      Alert.alert('Erro', 'Verifique os campos de segurança.');
      return;
    }

    setLoadingSubmit(true);

    try {
      await configService.alterarSenha(currentUserId, {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
        confirmar_senha: confirmarSenha,
      });

      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao alterar senha:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Não foi possível alterar a senha.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  }, [validarSeguranca, currentUserId, senhaAtual, novaSenha, confirmarSenha]);

  const handleAdicionarMetodoPagamento = useCallback(async () => {
    Keyboard.dismiss();

    if (!currentUserId) {
      Alert.alert('Erro', 'Usuário não encontrado.');
      return;
    }

    if (!validarMetodoPagamento()) {
      Alert.alert('Erro', 'Verifique os dados do método de pagamento.');
      return;
    }

    setLoadingSubmit(true);

    const payload: Record<string, string> = { tipo: novoMetodoPagamento.tipo };
    const tipo = novoMetodoPagamento.tipo;

    if (tipo === 'cartao_credito' || tipo === 'cartao_debito') {
      payload.numero_cartao = novoMetodoPagamento.numero_cartao.replace(/\D/g, '');
      payload.nome_cartao = novoMetodoPagamento.nome_cartao.trim();
      payload.data_validade = novoMetodoPagamento.data_validade.trim();
      payload.cvv = novoMetodoPagamento.cvv.replace(/\D/g, '');
    } else if (tipo === 'pix') {
      payload.chave_pix = novoMetodoPagamento.chave_pix.trim();
    } else if (tipo === 'paypal') {
      payload.email_paypal = novoMetodoPagamento.email_paypal.trim();
    }

    try {
      const isEdit = Boolean(metodoPagamentoEmEdicao?.id);

      if (isEdit) {
        await configService.atualizarMetodoPagamento(currentUserId, metodoPagamentoEmEdicao!.id, payload);
      } else {
        await configService.adicionarMetodoPagamento(currentUserId, payload);
      }

      await refreshMetodosPagamento();
      setNovoMetodoPagamento(createDefaultMetodoPagamento());
      setMetodoPagamentoEmEdicao(null);
      setErrors((prev) => {
        const { numero_cartao, nome_cartao, data_validade, cvv, chave_pix, email_paypal, ...rest } = prev;
        return rest;
      });

      Alert.alert('Sucesso', isEdit ? 'Método de pagamento atualizado!' : 'Método de pagamento adicionado!');
    } catch (error: any) {
      console.error('[ConfigContext] Erro ao salvar método de pagamento:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Não foi possível salvar o método de pagamento.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  }, [currentUserId, validarMetodoPagamento, novoMetodoPagamento, metodoPagamentoEmEdicao, refreshMetodosPagamento]);

  const handleRemoverMetodoPagamento = useCallback(
    async (pagamentoId: number) => {
      if (!currentUserId) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        return;
      }

      setLoadingSubmit(true);

      try {
        await configService.removerMetodoPagamento(currentUserId, pagamentoId);
        await refreshMetodosPagamento();

        if (metodoPagamentoEmEdicao?.id === pagamentoId) {
          setMetodoPagamentoEmEdicao(null);
          setNovoMetodoPagamento(createDefaultMetodoPagamento());
        }

        Alert.alert('Sucesso', 'Método de pagamento removido!');
      } catch (error: any) {
        console.error('[ConfigContext] Erro ao remover método de pagamento:', error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Não foi possível remover o método de pagamento.';
        Alert.alert('Erro', errorMessage);
      } finally {
        setLoadingSubmit(false);
      }
    },
    [currentUserId, refreshMetodosPagamento, metodoPagamentoEmEdicao],
  );

  const iniciarEdicaoMetodoPagamento = useCallback(
    (metodo: MetodoPagamentoResumo) => {
      setMetodoPagamentoEmEdicao(metodo);

      const form = createMetodoPagamentoFromTipo(metodo.tipo);

      if (metodo.tipo === 'cartao_credito' || metodo.tipo === 'cartao_debito') {
        form.nome_cartao = metodo.nome_cartao ?? '';
        form.data_validade = metodo.data_validade ?? '';
      } else if (metodo.tipo === 'paypal') {
        form.email_paypal = metodo.email_paypal ?? '';
      }

      setNovoMetodoPagamento(form);
      setErrors((prev) => {
        const { numero_cartao, nome_cartao, data_validade, cvv, chave_pix, email_paypal, ...rest } = prev;
        return rest;
      });
    },
    [],
  );

  const cancelarEdicaoMetodoPagamento = useCallback(() => {
    setMetodoPagamentoEmEdicao(null);
    setNovoMetodoPagamento(createDefaultMetodoPagamento());
    setErrors((prev) => {
      const { numero_cartao, nome_cartao, data_validade, cvv, chave_pix, email_paypal, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleDefinirMetodoPagamentoPadrao = useCallback(
    async (pagamentoId: number) => {
      if (!currentUserId) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        return;
      }

      setLoadingSubmit(true);

      try {
        const metodos = await configService.definirMetodoPagamentoPrincipal(currentUserId, pagamentoId);
        setMetodosPagamento(Array.isArray(metodos) ? metodos : []);
        Alert.alert('Sucesso', 'Método definido como padrão!');
      } catch (error: any) {
        console.error('[ConfigContext] Erro ao definir método padrão:', error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Não foi possível definir o método como padrão.';
        Alert.alert('Erro', errorMessage);
      } finally {
        setLoadingSubmit(false);
      }
    },
    [currentUserId],
  );

  const isEditandoMetodoPagamento = useMemo(() => metodoPagamentoEmEdicao !== null, [metodoPagamentoEmEdicao]);

  const handleUpdateNomeDocumento = useCallback(
    async (novoNome: string, novoDocumento: string) => {
      if (!currentUserId) {
        throw new Error('Usuário não encontrado.');
      }

      const updateData: Record<string, string> = { pessoa_nome: novoNome };

      if (tipoUsuario === 'Fisica') {
        updateData.pessoa_cpf = novoDocumento;
      }

      if (tipoUsuario === 'Juridica') {
        updateData.pessoa_cnpj = novoDocumento;
      }

      await pessoaService.atualizarPessoa(currentUserId, updateData);

      setNome(novoNome);
      if (tipoUsuario === 'Fisica') {
        setCpf(novoDocumento);
      } else if (tipoUsuario === 'Juridica') {
        setCnpj(novoDocumento);
      }
    },
    [currentUserId, tipoUsuario],
  );

  const handleUpdatePerfilCompleto = useCallback(
    async (novoNome: string, novoEmail: string, novoTelefone: string) => {
      if (!currentUserId) {
        throw new Error('Usuário não encontrado.');
      }

      await pessoaService.atualizarPessoa(currentUserId, {
        pessoa_nome: novoNome,
        pessoa_email: novoEmail,
        pessoa_telefone: novoTelefone,
      });

      setNome(novoNome);
      setEmail(novoEmail);
      setTelefone(novoTelefone);
    },
    [currentUserId],
  );

  const contextValue: ConfigContextValue = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      nome,
      setNome,
      email,
      setEmail,
      telefone,
      setTelefone,
      tipoUsuario,
      setTipoUsuario,
      cpf,
      setCpf,
      cnpj,
      setCnpj,
      fornecedorNum,
      setFornecedorNum,
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
      cidadeId,
      setCidadeId,
      senhaAtual,
      setSenhaAtual,
      novaSenha,
      setNovaSenha,
      confirmarSenha,
      setConfirmarSenha,
      autenticacao2FA,
      setAutenticacao2FA,
  loading2FA,
  twoFASetupVisible,
  twoFAQRCode,
  twoFASecret,
  twoFAValidationCode,
  setTwoFAValidationCode: handleTwoFACodeInput,
  twoFAError,
  twoFASetupMode,
  handleToggleTwoFactor,
  handleConfirmTwoFactorCode,
  handleShowTwoFactorSetup,
  closeTwoFactorSetup,
      emailNotificacoes,
      setEmailNotificacoes,
      smsNotificacoes,
      setSmsNotificacoes,
      marketingNotificacoes,
      setMarketingNotificacoes,
      metodosPagamento,
      novoMetodoPagamento,
      setNovoMetodoPagamento,
  metodoPagamentoEmEdicao,
  iniciarEdicaoMetodoPagamento,
  cancelarEdicaoMetodoPagamento,
  isEditandoMetodoPagamento,
      loadingData,
      loadingSubmit,
      setLoadingSubmit,
      loadingCep,
      errors,
      setErrors,
      currentUserId,
      handleCepBlur,
      handleSubmitPerfil,
      handleSubmitEndereco,
      handleSubmitNotificacoes,
      handleSubmitSeguranca,
      handleAdicionarMetodoPagamento,
      handleRemoverMetodoPagamento,
  handleDefinirMetodoPagamentoPadrao,
      refreshMetodosPagamento,
      validarPerfil,
      validarEndereco,
      validarSeguranca,
      validarMetodoPagamento,
      clearErrors,
      handleUpdateNomeDocumento,
      handleUpdatePerfilCompleto,
      loadUserData,
    }),
    [
      activeTab,
      nome,
      email,
      telefone,
      tipoUsuario,
      cpf,
      cnpj,
      fornecedorNum,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cidadeId,
      senhaAtual,
      novaSenha,
      confirmarSenha,
      autenticacao2FA,
  loading2FA,
  twoFASetupVisible,
  twoFAQRCode,
  twoFASecret,
  twoFAValidationCode,
  twoFAError,
  twoFASetupMode,
      emailNotificacoes,
      smsNotificacoes,
      marketingNotificacoes,
      metodosPagamento,
      novoMetodoPagamento,
      loadingData,
      loadingSubmit,
      loadingCep,
      errors,
      currentUserId,
      handleCepBlur,
      handleSubmitPerfil,
      handleSubmitEndereco,
      handleSubmitNotificacoes,
      handleSubmitSeguranca,
      handleAdicionarMetodoPagamento,
      handleRemoverMetodoPagamento,
      validarPerfil,
      validarEndereco,
      validarSeguranca,
      validarMetodoPagamento,
      clearErrors,
      handleUpdateNomeDocumento,
      handleUpdatePerfilCompleto,
      handleToggleTwoFactor,
      handleConfirmTwoFactorCode,
      handleShowTwoFactorSetup,
      closeTwoFactorSetup,
      handleTwoFACodeInput,
  metodoPagamentoEmEdicao,
  iniciarEdicaoMetodoPagamento,
  cancelarEdicaoMetodoPagamento,
  isEditandoMetodoPagamento,
  handleDefinirMetodoPagamentoPadrao,
  refreshMetodosPagamento,
  loadUserData,
    ],
  );

  return <ConfigContext.Provider value={contextValue}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
