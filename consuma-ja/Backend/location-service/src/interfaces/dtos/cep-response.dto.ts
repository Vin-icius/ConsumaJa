export interface CepResponseDto {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string; // Sigla UF
    cidadeId: number; // Código IBGE da cidade
    estadoId: number; // Código IBGE do estado
    ddd: string;
  }