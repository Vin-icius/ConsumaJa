import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Alert, Keyboard } from 'react-native'
import authService from '../../services/authService'
import pessoaService from '../../services/pessoaService'
import locationService from '../../services/locationService'
import configService from '../../services/configService'

// Tipos
export type PessoaTipo = "Fisica" | "Juridica" | "Admin" | ""
export type TabType = "perfil" | "endereco" | "notificacoes" | "seguranca" | "pagamento"

export interface ConfigContextType {
  // Estados da aba ativa
  activeTab: TabType
  setActiveTab: (tab: TabType) => void

  // Estados do perfil
  nome: string
  setNome: (nome: string) => void
  email: string
  setEmail: (email: string) => void
  telefone: string
  setTelefone: (telefone: string) => void
  tipoUsuario: PessoaTipo
  setTipoUsuario: (tipo: PessoaTipo) => void
  cpf: string
  setCpf: (cpf: string) => void
  cnpj: string
  setCnpj: (cnpj: string) => void
  fornecedorNum: string
  setFornecedorNum: (num: string) => void

  // Estados do endereço
  cep: string
  setCep: (cep: string) => void
  rua: string
  setRua: (rua: string) => void
  numero: string
  setNumero: (numero: string) => void
  complemento: string
  setComplemento: (complemento: string) => void
  bairro: string
  setBairro: (bairro: string) => void
  cidade: string
  setCidade: (cidade: string) => void
  estado: string
  setEstado: (estado: string) => void
  cidadeId: number | null
  setCidadeId: (id: number | null) => void

  // Estados de segurança (senha)
  senhaAtual: string
  setSenhaAtual: (senha: string) => void
  novaSenha: string
  setNovaSenha: (senha: string) => void
  confirmarSenha: string
  setConfirmarSenha: (senha: string) => void
  autenticacao2FA: boolean
  setAutenticacao2FA: (enabled: boolean) => void

  // Estados de notificações
  emailNotificacoes: boolean
  setEmailNotificacoes: (enabled: boolean) => void
  smsNotificacoes: boolean
  setSmsNotificacoes: (enabled: boolean) => void
  marketingNotificacoes: boolean
  setMarketingNotificacoes: (enabled: boolean) => void

  // Estados de métodos de pagamento
  metodosPagamento: any[]
  novoMetodoPagamento: {
    tipo: string
    numero_cartao: string
    nome_cartao: string
    data_validade: string
    cvv: string
  }
  setNovoMetodoPagamento: (metodo: any) => void

  // Estados de controle
  loadingData: boolean
  loadingSubmit: boolean
  setLoadingSubmit: (loading: boolean) => void
  loadingCep: boolean
  errors: { [key: string]: string }
  setErrors: (errors: { [key: string]: string }) => void
  currentUserId: number | null
  handleCepBlur: () => Promise<void>
  handleSubmitPerfil: () => Promise<void>
  handleSubmitEndereco: () => Promise<void>
  handleSubmitNotificacoes: () => Promise<void>
  handleSubmitSeguranca: () => Promise<void>
  handleAdicionarMetodoPagamento: () => Promise<void>
  handleRemoverMetodoPagamento: (pagamentoId: number) => Promise<void>
  validarPerfil: () => boolean
  validarEndereco: () => boolean
  validarSeguranca: () => boolean
  validarMetodoPagamento: () => boolean
  clearErrors: () => void
  handleUpdateNomeDocumento: (nome: string, documento: string) => Promise<void>
  handleUpdatePerfilCompleto: (nome: string, email: string, telefone: string) => Promise<void>
  loadUserData: () => Promise<void>
}

// Contexto
const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

// Provider
export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados da aba ativa
  const [activeTab, setActiveTab] = useState<TabType>("perfil")

  // Estados do perfil
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [tipoUsuario, setTipoUsuario] = useState<PessoaTipo>("Fisica")
  const [cpf, setCpf] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [fornecedorNum, setFornecedorNum] = useState("")

  // Estados do endereço
  const [cep, setCep] = useState("")
  const [rua, setRua] = useState("")
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [bairro, setBairro] = useState("")
  const [cidade, setCidade] = useState("")
  const [estado, setEstado] = useState("")
  const [cidadeId, setCidadeId] = useState<number | null>(null)

  // Estados de segurança
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [autenticacao2FA, setAutenticacao2FA] = useState(false)

  // Estados de notificações
  const [emailNotificacoes, setEmailNotificacoes] = useState(true)
  const [smsNotificacoes, setSmsNotificacoes] = useState(false)
  const [marketingNotificacoes, setMarketingNotificacoes] = useState(true)

  // Estados de métodos de pagamento
  const [metodosPagamento, setMetodosPagamento] = useState<any[]>([])
  const [novoMetodoPagamento, setNovoMetodoPagamento] = useState({
    tipo: 'credito',
    numero_cartao: '',
    nome_cartao: '',
    data_validade: '',
    cvv: '',
  })

  // Estados de controle
  const [loadingData, setLoadingData] = useState(false)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  // Busca dados do usuário quando solicitado
  const loadUserData = useCallback(async () => {
    setLoadingData(true)
    setErrors({})

    try {
      // Primeiro, obter o ID do usuário logado
      const currentUser = await authService.getCurrentUser()
      const userId = currentUser?.pessoa_id

      if (!userId) {
        setErrors({ form: "Usuário não autenticado. Faça login novamente." })
        setLoadingData(false)
        return
      }

      setCurrentUserId(userId)

      // Buscar dados reais do usuário
      const userData = await pessoaService.buscarPessoaPorId(userId)

      // Buscar configurações do usuário
      let configData = null
      try {
        configData = await configService.getConfiguracoesUsuario(userId)
      } catch (configError) {
        console.warn('Erro ao buscar configurações:', configError)
        // Configurações padrão se não conseguir buscar
        configData = {
          notificacoes: {
            email_notificacoes: true,
            sms_notificacoes: false,
            marketing_notificacoes: true,
            push_notificacoes: true,
          },
          metodos_pagamento: [],
          autenticacao_2fa: false,
        }
      }

      // Preencher dados do perfil
      setNome(userData.pessoa_nome || "")
      setEmail(userData.pessoa_email || "")
      setTelefone(userData.pessoa_telefone || "")
      setTipoUsuario(userData.pessoa_tipo as PessoaTipo || "Fisica")

      // Preencher CPF/CNPJ baseado no tipo
      if (userData.pessoa_tipo === "Fisica") {
        setCpf(userData.pessoa_cpf || "")
      } else if (userData.pessoa_tipo === "Juridica") {
        setCnpj(userData.pessoa_cnpj || "")
        setFornecedorNum(userData.pessoa_num_fornecedor?.toString() || "")
      }

      // Preencher dados de endereço se existir
      if (userData.endereco) {
        const endereco = userData.endereco
        setCep(endereco.endereco_cep || "")
        setRua(endereco.endereco_rua || "")
        setNumero(endereco.endereco_numero || "")
        setComplemento(endereco.endereco_complemento || "")
        setBairro(endereco.endereco_bairro || "")

        // Buscar nome da cidade e estado se houver cidade_id
        if (endereco.cidade_id) {
          setCidadeId(endereco.cidade_id)
          try {
            // Buscar dados da cidade
            const cidadeData = await locationService.getCidadeById(endereco.cidade_id)
            setCidade(cidadeData.cidade_nome || "")
            // Buscar dados do estado da cidade
            if (cidadeData.estado_id) {
              const estadoData = await locationService.getEstadoById(cidadeData.estado_id)
              setEstado(estadoData.estado_nome || "")
            }
          } catch (cidadeError) {
            console.warn('Erro ao buscar dados da cidade:', cidadeError)
            // Mantém os campos vazios se não conseguir buscar
          }
        }
      }

      // Preencher configurações
      if (configData?.notificacoes) {
        setEmailNotificacoes(configData.notificacoes.email_notificacoes ?? true)
        setSmsNotificacoes(configData.notificacoes.sms_notificacoes ?? false)
        setMarketingNotificacoes(configData.notificacoes.marketing_notificacoes ?? true)
      }

      if (configData?.metodos_pagamento) {
        setMetodosPagamento(configData.metodos_pagamento)
      }

      if (configData?.autenticacao_2fa !== undefined) {
        setAutenticacao2FA(configData.autenticacao_2fa)
      }

      setLoadingData(false)
    } catch (error: any) {
      console.error("Erro ao buscar usuário:", error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Erro ao carregar dados do usuário."
      setErrors({ form: errorMessage })
      setLoadingData(false)
    }
  }, [])

  // Funções de validação
  const validarPerfil = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!nome.trim()) newErrors.nome = "Nome obrigatório"
    if (!email.includes("@")) newErrors.email = "Email inválido"
    if (!telefone || telefone.replace(/\D/g, "").length < 10) newErrors.telefone = "Telefone inválido"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validarEndereco = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!cep || cep.replace(/\D/g, "").length !== 8) newErrors.cep = "CEP inválido"
    if (!rua.trim()) newErrors.rua = "Rua obrigatória"
    if (!numero.trim()) newErrors.numero = "Número obrigatório"
    if (!bairro.trim()) newErrors.bairro = "Bairro obrigatório"
    if (!cidade.trim()) newErrors.cidade = "Cidade obrigatória"
    if (!estado.trim()) newErrors.estado = "Estado obrigatório"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validarSeguranca = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!senhaAtual) newErrors.senhaAtual = "Senha atual obrigatória"
    if (!novaSenha) newErrors.novaSenha = "Nova senha obrigatória"
    if (novaSenha.length < 6) newErrors.novaSenha = "Nova senha deve ter pelo menos 6 caracteres"
    if (novaSenha !== confirmarSenha) newErrors.confirmarSenha = "As senhas não coincidem"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Busca CEP
  const handleCepBlur = useCallback(async () => {
    const cepLimpo = cep.replace(/\D/g, "")
    if (!cepLimpo || cepLimpo.length !== 8) return

    Keyboard.dismiss()
    setLoadingCep(true)
    setErrors((prev) => {
      const { cep, rua, bairro, cidade, estado, ...rest } = prev
      return rest
    })

    try {
      // Usar API real de CEP
      const response = await locationService.lookupCep(cepLimpo)
      const addressData = response

      // Preencher campos com dados retornados
      setRua(addressData.logradouro || "")
      setBairro(addressData.bairro || "")
      setCidade(addressData.localidade || "")
      setEstado(addressData.uf || "")

      // Tentar encontrar cidade_id baseado nos dados retornados
      // Isso pode precisar de uma busca adicional no backend
      setCidadeId(null) // Resetar por enquanto

      setLoadingCep(false)
    } catch (error: any) {
      console.error("Erro ao buscar CEP:", error)
      setErrors((prev) => ({ ...prev, cep: "CEP não encontrado ou inválido" }))
      setLoadingCep(false)
    }
  }, [cep])

  // Submit do perfil
  const handleSubmitPerfil = async () => {
    Keyboard.dismiss()
    if (!validarPerfil()) {
      Alert.alert("Erro", "Verifique os campos.")
      return
    }

    if (!currentUserId) {
      Alert.alert("Erro", "ID do usuário não encontrado.")
      return
    }

    setLoadingSubmit(true)

    try {
      // Preparar dados para atualização
      const updateData = {
        pessoa_email: email,
        pessoa_telefone: telefone,
      }

      // Enviar para API
      await pessoaService.atualizarPessoa(currentUserId, updateData)

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!")
      setLoadingSubmit(false)
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Não foi possível atualizar o perfil."
      Alert.alert("Erro", errorMessage)
      setLoadingSubmit(false)
    }
  }

  // Submit do endereço
  const handleSubmitEndereco = async () => {
    Keyboard.dismiss()
    if (!validarEndereco()) {
      Alert.alert("Erro", "Verifique os campos.")
      return
    }

    if (!currentUserId) {
      Alert.alert("Erro", "ID do usuário não encontrado.")
      return
    }

    setLoadingSubmit(true)

    try {
      // Preparar dados para atualização incluindo endereço
      const updateData = {
        endereco: {
          endereco_cep: cep.replace(/\D/g, ""),
          endereco_rua: rua,
          endereco_numero: numero,
          endereco_complemento: complemento || null,
          endereco_bairro: bairro,
          cidade_id: cidadeId, // Assumindo que cidadeId foi definido durante busca de CEP
        }
      }

      // Enviar para API
      await pessoaService.atualizarPessoa(currentUserId, updateData)

      Alert.alert("Sucesso", "Endereço atualizado com sucesso!")
      setLoadingSubmit(false)
    } catch (error: any) {
      console.error("Erro ao atualizar endereço:", error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Não foi possível atualizar o endereço."
      Alert.alert("Erro", errorMessage)
      setLoadingSubmit(false)
    }
  }

  // Submit das notificações
  const handleSubmitNotificacoes = async () => {
    if (!currentUserId) {
      Alert.alert("Erro", "ID do usuário não encontrado.")
      return
    }

    setLoadingSubmit(true)

    try {
      await configService.atualizarNotificacoes(currentUserId, {
        email_notificacoes: emailNotificacoes,
        sms_notificacoes: smsNotificacoes,
        marketing_notificacoes: marketingNotificacoes,
        push_notificacoes: true, // Mantém push sempre ativo por padrão
      })

      Alert.alert("Sucesso", "Preferências de notificação atualizadas!")
      setLoadingSubmit(false)
    } catch (error: any) {
      console.error("Erro ao atualizar notificações:", error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Não foi possível atualizar as preferências."
      Alert.alert("Erro", errorMessage)
      setLoadingSubmit(false)
    }
  }

  // Submit da segurança
  const handleSubmitSeguranca = async () => {
    Keyboard.dismiss()
    if (!validarSeguranca()) {
      Alert.alert("Erro", "Verifique os campos.")
      return
    }

    if (!currentUserId) {
      Alert.alert("Erro", "ID do usuário não encontrado.")
      return
    }

    setLoadingSubmit(true)

    try {
      await configService.alterarSenha(currentUserId, {
        senha_atual: senhaAtual,
        nova_senha: novaSenha,
        confirmar_senha: confirmarSenha,
      })

      Alert.alert("Sucesso", "Senha alterada com sucesso!")
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmarSenha("")
      setLoadingSubmit(false)
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Não foi possível alterar a senha."
      Alert.alert("Erro", errorMessage)
      setLoadingSubmit(false)
    }
  }

  const validarMetodoPagamento = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!novoMetodoPagamento.numero_cartao || novoMetodoPagamento.numero_cartao.replace(/\D/g, "").length < 13) {
      newErrors.numero_cartao = "Número do cartão inválido"
    }
    if (!novoMetodoPagamento.nome_cartao.trim()) {
      newErrors.nome_cartao = "Nome no cartão obrigatório"
    }
    if (!novoMetodoPagamento.data_validade || !/^\d{2}\/\d{2}$/.test(novoMetodoPagamento.data_validade)) {
      newErrors.data_validade = "Data de validade deve estar no formato MM/AA"
    }
    if (!novoMetodoPagamento.cvv || novoMetodoPagamento.cvv.length < 3) {
      newErrors.cvv = "CVV deve ter pelo menos 3 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Adicionar método de pagamento
  const handleAdicionarMetodoPagamento = async () => {
    Keyboard.dismiss()
    if (!validarMetodoPagamento()) {
      Alert.alert("Erro", "Verifique os campos do cartão.")
      return
    }

    if (!currentUserId) {
      Alert.alert("Erro", "ID do usuário não encontrado.")
      return
    }

    setLoadingSubmit(true)

    try {
      const metodo = await configService.adicionarMetodoPagamento(currentUserId, {
        tipo: novoMetodoPagamento.tipo,
        numero_cartao: novoMetodoPagamento.numero_cartao.replace(/\D/g, ""),
        nome_cartao: novoMetodoPagamento.nome_cartao,
        data_validade: novoMetodoPagamento.data_validade,
        cvv: novoMetodoPagamento.cvv,
      })

      // Atualizar lista de métodos de pagamento
      setMetodosPagamento(prev => [...prev, metodo])

      // Limpar formulário
      setNovoMetodoPagamento({
        tipo: 'credito',
        numero_cartao: '',
        nome_cartao: '',
        data_validade: '',
        cvv: '',
      })

      Alert.alert("Sucesso", "Método de pagamento adicionado com sucesso!")
      setLoadingSubmit(false)
    } catch (error: any) {
      console.error("Erro ao adicionar método de pagamento:", error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Não foi possível adicionar o método de pagamento."
      Alert.alert("Erro", errorMessage)
      setLoadingSubmit(false)
    }
  }

  // Remover método de pagamento
  const handleRemoverMetodoPagamento = async (pagamentoId: number) => {
    console.log('handleRemoverMetodoPagamento chamado com ID:', pagamentoId);
    if (!currentUserId) {
      console.log('ERRO: currentUserId não encontrado');
      Alert.alert("Erro", "ID do usuário não encontrado.")
      return
    }

    console.log('Mostrando alerta de confirmação...');

    // TESTE: Vamos pular o Alert.alert e executar diretamente
    console.log('TESTE: Executando remoção diretamente sem Alert.alert');
    setLoadingSubmit(true)
    try {
      console.log('Fazendo chamada para configService.removerMetodoPagamento...');
      await configService.removerMetodoPagamento(currentUserId, pagamentoId)
      console.log('Requisição concluída com sucesso');

      // Atualizar lista removendo o método
      setMetodosPagamento(prev => prev.filter(m => m.id !== pagamentoId))

      Alert.alert("Sucesso", "Método de pagamento removido com sucesso!")
      setLoadingSubmit(false)
    } catch (error: any) {
      console.error("Erro ao remover método de pagamento:", error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          "Não foi possível remover o método de pagamento."
      Alert.alert("Erro", errorMessage)
      setLoadingSubmit(false)
    }

    /*
    Alert.alert(
      "Confirmar remoção",
      "Tem certeza que deseja remover este método de pagamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            console.log('Botão "Remover" clicado, iniciando processo...');
            setLoadingSubmit(true)
            try {
              console.log('Fazendo chamada para configService.removerMetodoPagamento...');
              await configService.removerMetodoPagamento(currentUserId, pagamentoId)
              console.log('Requisição concluída com sucesso');

              // Atualizar lista removendo o método
              setMetodosPagamento(prev => prev.filter(m => m.id !== pagamentoId))

              Alert.alert("Sucesso", "Método de pagamento removido com sucesso!")
              setLoadingSubmit(false)
            } catch (error: any) {
              console.error("Erro ao remover método de pagamento:", error)
              const errorMessage = error.response?.data?.message ||
                                  error.response?.data?.error ||
                                  "Não foi possível remover o método de pagamento."
              Alert.alert("Erro", errorMessage)
              setLoadingSubmit(false)
            }
          }
        }
      ]
    )
    */
  }

  const clearErrors = () => {
    setErrors({})
  }

  // Atualizar nome e documento do perfil
  const handleUpdateNomeDocumento = async (novoNome: string, novoDocumento: string) => {
    if (!currentUserId) {
      throw new Error("ID do usuário não encontrado.")
    }

    try {
      // Preparar dados para atualização
      const updateData: any = {
        pessoa_nome: novoNome,
      }

      // Adicionar documento baseado no tipo de usuário
      if (tipoUsuario === "Fisica") {
        updateData.pessoa_cpf = novoDocumento
      } else if (tipoUsuario === "Juridica") {
        updateData.pessoa_cnpj = novoDocumento
      }

      // Enviar para API
      await pessoaService.atualizarPessoa(currentUserId, updateData)

      // Atualizar estados locais
      setNome(novoNome)
      if (tipoUsuario === "Fisica") {
        setCpf(novoDocumento)
      } else if (tipoUsuario === "Juridica") {
        setCnpj(novoDocumento)
      }
    } catch (error: any) {
      console.error("Erro ao atualizar nome e documento:", error)
      throw error
    }
  }

  // Atualizar nome, email e telefone do perfil
  const handleUpdatePerfilCompleto = async (novoNome: string, novoEmail: string, novoTelefone: string) => {
    if (!currentUserId) {
      throw new Error("ID do usuário não encontrado.")
    }

    try {
      // Preparar dados para atualização
      const updateData = {
        pessoa_nome: novoNome,
        pessoa_email: novoEmail,
        pessoa_telefone: novoTelefone,
      }

      // Enviar para API
      await pessoaService.atualizarPessoa(currentUserId, updateData)

      // Atualizar estados locais
      setNome(novoNome)
      setEmail(novoEmail)
      setTelefone(novoTelefone)
    } catch (error: any) {
      console.error("Erro ao atualizar perfil completo:", error)
      throw error
    }
  }

  const value: ConfigContextType = {
    // Estados da aba ativa
    activeTab,
    setActiveTab,

    // Estados do perfil
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

    // Estados do endereço
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

    // Estados de segurança
    senhaAtual,
    setSenhaAtual,
    novaSenha,
    setNovaSenha,
    confirmarSenha,
    setConfirmarSenha,
    autenticacao2FA,
    setAutenticacao2FA,

    // Estados de notificações
    emailNotificacoes,
    setEmailNotificacoes,
    smsNotificacoes,
    setSmsNotificacoes,
    marketingNotificacoes,
    setMarketingNotificacoes,

    // Estados de métodos de pagamento
    metodosPagamento,
    novoMetodoPagamento,
    setNovoMetodoPagamento,

    // Estados de controle
    loadingData,
    loadingSubmit,
    setLoadingSubmit,
    loadingCep,
    errors,
    setErrors,
    currentUserId,

    // Funções
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
    loadUserData,
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

// Hook para usar o contexto
export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}