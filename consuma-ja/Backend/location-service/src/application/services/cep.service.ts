import { EstadoRepository } from '../../domain/repositories/estado.repository';
import { CidadeRepository } from '../../domain/repositories/cidade.repository';
import { ViaCepClient, ViaCepAddress } from '../../infrastructure/clients/via-cep.client';
import { AppError } from '../../common/errors/app-error'; // <<< Corrigido o caminho da importação
import { CepResponseDto } from '../../interfaces/dtos/cep-response.dto';
import { ufToEstadoNomeMap } from '../../common/utils/uf-map';

export class CepService {
  constructor(
    private viaCepClient: ViaCepClient,
    private estadoRepository: EstadoRepository,
    private cidadeRepository: CidadeRepository,
  ) {}

  async lookupAndPrepareAddress(cep: string): Promise<CepResponseDto> {
    try {
      // 1. Busca na API Externa
      const addressData = await this.viaCepClient.fetchAddress(cep);

      // Valida se a API retornou dados válidos
      if (!addressData) {
        // Erro operacional comum: CEP não encontrado pela API externa
        throw new AppError('CEP não encontrado ou inválido na base externa.', 404); // 404 Not Found
      }
      // Validações adicionais para dados essenciais da API
      if (!addressData.uf || !addressData.localidade || !addressData.ddd) {
          console.error(`[CepService] Resposta incompleta da API ViaCEP para CEP ${cep}:`, addressData);
          // Erro interno ou problema na API externa, não erro do usuário
          throw new AppError('Dados externos incompletos para processar o CEP.', 502, false); // 502 Bad Gateway ou 500
      }

      // 2. Processa Estado (Find or Create)
      const estadoSiglaUpper = addressData.uf.toUpperCase();
      const estadoNome = ufToEstadoNomeMap[estadoSiglaUpper];
      if (!estadoNome) {
          // Se a UF da API não está no nosso mapeamento, é um erro interno/inesperado
          console.error(`[CepService] UF "${estadoSiglaUpper}" recebida da API não encontrada no mapeamento interno.`);
          throw new AppError(`Sigla de estado (${estadoSiglaUpper}) inválida ou não mapeada.`, 500, false); // 500 Internal Server Error
      }
      // O método findOrCreate do repositório já trata erros de DB e lança AppError
      const estado = await this.estadoRepository.findOrCreate(estadoSiglaUpper, estadoNome);


      // 3. Processa Cidade (Find or Create)
      // O método findOrCreate do repositório já trata erros de DB (FK, DUP) e lança AppError
      const cidade = await this.cidadeRepository.findOrCreate(
          addressData.localidade, // Nome da cidade vindo da API
          addressData.ddd,       // DDD vindo da API
          estado.estado_id       // ID do estado encontrado/criado no passo anterior
      );


      // 4. Monta a Resposta Final com dados do nosso banco (mais confiáveis/atualizados)
      return {
        cep: addressData.cep, // Mantém o CEP original formatado da API
        logradouro: addressData.logradouro,
        complemento: addressData.complemento,
        bairro: addressData.bairro,
        cidade: cidade.cidade_nome,      // Nome da cidade do nosso DB
        estado: estado.estado_sigla,     // Sigla do estado do nosso DB
        cidadeId: cidade.cidade_id,      // ID da cidade do nosso DB
        estadoId: estado.estado_id,      // ID do estado do nosso DB
        ddd: cidade.regiao_ddd,          // DDD da cidade do nosso DB (pode ter sido atualizado)
      };

    } catch (error: any) {
        // Se o erro já for um AppError (lançado acima ou pelos repositórios), apenas relança
        if (error instanceof AppError) {
            throw error;
        }

        // Se for um erro inesperado (ex: falha de rede no ViaCepClient, erro não tratado nos repos)
        console.error(`[CepService.lookupAndPrepareAddress] Erro inesperado ao processar CEP ${cep}:`, error);
        throw new AppError(`Erro ao processar a consulta do CEP ${cep}.`, 500, false); // Genérico, não operacional
    }
  }
}