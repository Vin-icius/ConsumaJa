import axios from 'axios';

// Interface para a resposta esperada da ViaCEP
export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export class ViaCepClient {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  async fetchAddress(cep: string): Promise<ViaCepAddress | null> {
    try {
      // Limpa o CEP, removendo caracteres não numéricos
      const cleanedCep = cep.replace(/\D/g, '');
      if (cleanedCep.length !== 8) {
        console.warn(`[ViaCepClient] CEP inválido fornecido: ${cep}`);
        return null; // Ou lançar um erro específico
      }

      const response = await axios.get<ViaCepAddress>(`${this.baseUrl}/${cleanedCep}/json/`);

      // ViaCEP retorna { erro: true } para CEPs não encontrados
      if (response.data.erro) {
        console.log(`[ViaCepClient] CEP não encontrado na ViaCEP: ${cleanedCep}`);
        return null;
      }

      // Retorna null se campos essenciais não vierem (pouco provável se não der erro)
      if (!response.data.localidade || !response.data.uf || !response.data.ibge || !response.data.ddd) {
          console.warn(`[ViaCepClient] Resposta incompleta para o CEP: ${cleanedCep}`);
          return null;
      }


      console.log(`[ViaCepClient] Endereço encontrado para CEP ${cleanedCep}:`, response.data);
      return response.data;

    } catch (error: any) {
      console.error(`[ViaCepClient] Erro ao buscar CEP ${cep}:`, error.message);
      // Poderia retornar null ou lançar um erro específico para tratamento no serviço
      return null;
    }
  }
}