// src/application/services/cidade.service.ts
import { Cidade } from '../../domain/entities/cidade.entity';
import { CidadeRepository } from '../../domain/repositories/cidade.repository';
import { EstadoRepository } from '../../domain/repositories/estado.repository';
import { AppError } from '../../common/errors/app-error';

// Definir tipo para os parâmetros de busca (boa prática)
interface FindAllCidadeParams {
    nome?: string;
    estadoSigla?: string;
    ddd?: string;
}

export class CidadeService {
  constructor(
    private cidadeRepository: CidadeRepository,
    private estadoRepository: EstadoRepository
  ) {}

  async createCidade(data: Omit<Cidade, 'cidade_id'>): Promise<Cidade> {
    try {
      // Validações (mantidas)
      if (!data.regiao_ddd || data.regiao_ddd.length < 2 || data.regiao_ddd.length > 4) {
         throw new AppError('Formato inválido para o DDD.', 400);
      }
       if (!data.cidade_nome || data.cidade_nome.trim() === '') {
           throw new AppError('O nome da cidade não pode ser vazio.', 400);
       }

      // Verificar se o Estado existe (mantido)
      const estado = await this.estadoRepository.findById(data.estado_id);
      if (!estado) {
        throw new AppError(`O estado com ID ${data.estado_id} não foi encontrado.`, 400);
      }

      // Verificar unicidade do nome dentro do estado (mantido)
      const cidadeExistenteComNome = await this.cidadeRepository.findByNomeAndEstadoId(data.cidade_nome, data.estado_id);
      if (cidadeExistenteComNome) {
        throw new AppError(`A cidade "${data.cidade_nome}" já existe no estado ${estado.estado_sigla} (ID: ${data.estado_id}).`, 409);
      }

      // Chama repo (mantido)
      const novaCidade = await this.cidadeRepository.create(data);
      return novaCidade;

    } catch (error: any) {
       if (error instanceof AppError) { throw error; }
       console.error("[CidadeService.createCidade] Erro inesperado:", error);
       throw new AppError("Erro ao criar a cidade.", 500, false);
    }
  }

  async getAllCidades(params?: FindAllCidadeParams): Promise<Cidade[]> {
    // Lógica mantida
     try {
        const cidades = await this.cidadeRepository.findAll(params);
        return cidades;
      } catch (error: any) {
          if (error instanceof AppError) { throw error; }
          console.error("[CidadeService.getAllCidades] Erro inesperado:", error);
          throw new AppError("Erro ao buscar lista de cidades.", 500, false);
      }
  }

  async deleteCidade(id: number): Promise<void> {
    // Lógica mantida
    try {
        const deleted = await this.cidadeRepository.delete(id);
        if (!deleted) {
             throw new AppError(`Cidade com ID ${id} não encontrada para exclusão.`, 404);
        }
    } catch (error: any) {
         if (error instanceof AppError) { throw error; }
         console.error(`[CidadeService.deleteCidade] Erro inesperado ao deletar cidade ${id}:`, error);
         throw new AppError(`Erro ao excluir a cidade ${id}.`, 500, false);
    }
  }

  async getCidadeById(id: number): Promise<Cidade> {
    // Lógica mantida
    try {
        const cidade = await this.cidadeRepository.findById(id);
        if (!cidade) {
            throw new AppError(`Cidade com ID ${id} não encontrada.`, 404);
        }
        return cidade;
    } catch (error: any) {
         if (error instanceof AppError) { throw error; }
         console.error(`[CidadeService.getCidadeById] Erro inesperado ao buscar cidade ${id}:`, error);
         throw new AppError(`Erro ao buscar cidade ${id}.`, 500, false);
    }
  }

  async updateCidade(id: number, data: Partial<Omit<Cidade, 'cidade_id' | 'estado_id'>>): Promise<Cidade> {
    try {
        // 1. Buscar a cidade existente (mantido)
        const cidadeExistente = await this.getCidadeById(id);
        const estadoId = cidadeExistente.estado_id; // Pega o estadoId atual

        // Cria uma cópia dos dados recebidos para poder modificar sem afetar o original
        const dataToUpdate: Partial<Omit<Cidade, 'cidade_id' | 'estado_id'>> = { ...data };

        // 2. Validar campos (mantido)
        if (dataToUpdate.regiao_ddd && (dataToUpdate.regiao_ddd.length < 2 || dataToUpdate.regiao_ddd.length > 4)) {
             throw new AppError('Formato inválido para o DDD.', 400);
        }
         if (dataToUpdate.cidade_nome !== undefined && dataToUpdate.cidade_nome.trim() === '') {
             throw new AppError('O nome da cidade não pode ser vazio.', 400);
         }

        // 3. Verificar unicidade do nome se ele foi alterado (mantido)
        if (dataToUpdate.cidade_nome && dataToUpdate.cidade_nome !== cidadeExistente.cidade_nome) {
            const outraCidadeComNome = await this.cidadeRepository.findByNomeAndEstadoId(dataToUpdate.cidade_nome, estadoId);
            if (outraCidadeComNome && outraCidadeComNome.cidade_id !== id) {
                 throw new AppError(`O nome de cidade "${dataToUpdate.cidade_nome}" já existe no estado ID ${estadoId} (pertence à cidade ID ${outraCidadeComNome.cidade_id}).`, 409);
            }
        }

        // ================================================================
        // <<< FIX: Remover explicitamente 'estado_id' dos dados a serem atualizados >>>
        // Mesmo que a DTO não tenha, garante que não seja passado inadvertidamente.
        // A propriedade na entidade/DTO é 'estado_id', mesmo que a coluna seja 'ESTADO_estado_id'.
        delete (dataToUpdate as any).estado_id;
        // ================================================================


        // 4. Chamar o repositório para atualizar (mantido)
        const cidadeAtualizada = await this.cidadeRepository.update(id, dataToUpdate);

        if (!cidadeAtualizada) {
             console.error(`[CidadeService.updateCidade] Repositório retornou null para cidade ${id} após update, mas ela existia.`);
             throw new AppError('Falha inesperada ao tentar atualizar a cidade.', 500, false);
        }

        return cidadeAtualizada;
    } catch (error: any) {
         if (error instanceof AppError) { throw error; }
         console.error(`[CidadeService.updateCidade] Erro inesperado ao atualizar cidade ${id}:`, error);
         throw new AppError(`Erro ao atualizar a cidade ${id}.`, 500, false);
    }
  }

  async getCidadesByEstado(estadoId: number): Promise<Cidade[]> {
    // Lógica mantida
    try {
        const estado = await this.estadoRepository.findById(estadoId);
        if (!estado) {
            throw new AppError(`Estado com ID ${estadoId} não encontrado.`, 404);
        }
        const cidades = await this.cidadeRepository.findByEstadoId(estadoId);
        return cidades;

    } catch (error: any) {
        if (error instanceof AppError) { throw error; }
        console.error(`[CidadeService.getCidadesByEstado] Erro inesperado ao buscar cidades do estado ${estadoId}:`, error);
        throw new AppError(`Erro ao buscar cidades do estado ${estadoId}.`, 500, false);
    }
  }
}