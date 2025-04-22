// src/application/services/estado.service.ts
import { Estado } from '../../domain/entities/estado.entity';
import { EstadoRepository } from '../../domain/repositories/estado.repository';
import { AppError } from '../../common/errors/app-error'; // <<< Corrigido o caminho da importação

export class EstadoService {
  // Injeção de Dependência do repositório
  constructor(private estadoRepository: EstadoRepository) {}

  async getAllEstados(params?: { nome?: string; sigla?: string }): Promise<Estado[]> {
    try {
      // A chamada ao repositório pode lançar um AppError (ex: 500 se DB falhar)
      const estados = await this.estadoRepository.findAll(params);
      return estados;
    } catch (error: any) {
        // Se já for um AppError lançado pelo repositório, relança ele
        if (error instanceof AppError) {
            throw error;
        }
        // Se for outro tipo de erro, loga e lança um AppError genérico
        console.error("[EstadoService.getAllEstados] Erro inesperado:", error);
        throw new AppError("Erro ao buscar lista de estados.", 500, false);
    }
  }

  async getEstadoById(id: number): Promise<Estado> {
     try {
        const estado = await this.estadoRepository.findById(id);
        if (!estado) {
            // Erro operacional claro: estado não encontrado
            throw new AppError('Estado não encontrado', 404); // 404 Not Found
        }
        return estado;
     } catch (error: any) {
         if (error instanceof AppError) { throw error; } // Relança AppErrors (como o 404 acima)
         console.error(`[EstadoService.getEstadoById] Erro inesperado ao buscar estado ${id}:`, error);
         throw new AppError(`Erro ao buscar estado ${id}.`, 500, false);
     }
  }

  async createEstado(data: Omit<Estado, 'estado_id'>): Promise<Estado> {
    // Validação de formato da sigla (antes de consultar o DB)
    if (data.estado_sigla.length < 2 || data.estado_sigla.length > 3) {
      throw new AppError('Sigla do estado deve ter entre 2 e 3 caracteres.', 400); // 400 Bad Request
    }
    // Normaliza a sigla para maiúsculas antes de verificar/salvar
    const siglaUpper = data.estado_sigla.toUpperCase();

    // Validação de unicidade (Nome, Sigla) ANTES de tentar criar
    // Usar Promise.all para verificar em paralelo (ligeiramente mais eficiente)
    try {
        const [nomeExists, siglaExists] = await Promise.all([
             this.estadoRepository.findByNome(data.estado_nome),
             this.estadoRepository.findBySigla(siglaUpper)
        ]);

        if (nomeExists) {
            // Usar 409 Conflict faz mais sentido para recurso que já existe
            throw new AppError(`O nome de estado "${data.estado_nome}" já existe.`, 409); // 409 Conflict
        }
        if (siglaExists) {
             throw new AppError(`A sigla de estado "${siglaUpper}" já existe.`, 409); // 409 Conflict
        }

        // Prepara dados finais para criação
        const dataToCreate = {
            ...data,
            estado_sigla: siglaUpper // Salva em maiúsculas
        };

        // Chama o repositório SEM o ID. O repo agora trata race conditions e outros erros de DB.
        const novoEstado = await this.estadoRepository.create(dataToCreate);
        return novoEstado;

    } catch (error: any) {
         if (error instanceof AppError) { throw error; } // Relança AppErrors (como os 409 acima ou erros do repo)
         console.error("[EstadoService.createEstado] Erro inesperado:", error);
         // Erro não esperado durante validação ou criação
         throw new AppError("Erro ao criar o estado.", 500, false);
    }
  }

  async updateEstado(id: number, data: Partial<Omit<Estado, 'estado_id'>>): Promise<Estado> {
    // 1. Verifica se o estado existe
    const estadoExistente = await this.getEstadoById(id); // Reusa getById que já trata 404 e erros 500

    // Prepara objeto de atualização e normaliza sigla se presente
    const dataToUpdate: Partial<Omit<Estado, 'estado_id'>> = { ...data };
    let siglaUpper: string | undefined = undefined;

    if (dataToUpdate.estado_sigla) {
        // Validação de formato da sigla
        if (dataToUpdate.estado_sigla.length < 2 || dataToUpdate.estado_sigla.length > 3) {
             throw new AppError('Sigla do estado deve ter entre 2 e 3 caracteres.', 400); // 400 Bad Request
        }
        siglaUpper = dataToUpdate.estado_sigla.toUpperCase();
        dataToUpdate.estado_sigla = siglaUpper; // Atualiza o DTO com a sigla normalizada
    }

    // 2. Validações de Unicidade (Apenas se os campos foram fornecidos e são diferentes)
    try {
        const checks: Promise<Estado | null>[] = [];
        // Verifica nome apenas se foi passado e é diferente do atual
        if (dataToUpdate.estado_nome && dataToUpdate.estado_nome !== estadoExistente.estado_nome) {
            checks.push(this.estadoRepository.findByNome(dataToUpdate.estado_nome));
        } else {
            checks.push(Promise.resolve(null)); // Placeholder para manter a ordem do Promise.all
        }
        // Verifica sigla apenas se foi passada e é diferente da atual
        if (siglaUpper && siglaUpper !== estadoExistente.estado_sigla) {
            checks.push(this.estadoRepository.findBySigla(siglaUpper));
        } else {
             checks.push(Promise.resolve(null));
        }

        const [nomeConflict, siglaConflict] = await Promise.all(checks);

        if (nomeConflict) {
            throw new AppError(`O nome de estado "${dataToUpdate.estado_nome}" já pertence a outro estado (ID: ${nomeConflict.estado_id}).`, 409); // 409 Conflict
        }
        if (siglaConflict) {
             throw new AppError(`A sigla de estado "${siglaUpper}" já pertence a outro estado (ID: ${siglaConflict.estado_id}).`, 409); // 409 Conflict
        }

        // 3. Chama o repositório para atualizar
        // O repositório trata erros de DB (como DUP_ENTRY em race condition)
        const estadoAtualizado = await this.estadoRepository.update(id, dataToUpdate);

        // O repo.update agora retorna null ou lança erro se não encontrou.
        // Como já checamos a existência no início, um null aqui seria inesperado.
        if (!estadoAtualizado) {
             console.error(`[EstadoService.updateEstado] Repositório retornou null para estado ${id} após update, mas ele existia.`);
             throw new AppError('Falha inesperada ao tentar atualizar o estado.', 500, false);
        }

        return estadoAtualizado;

    } catch (error: any) {
        if (error instanceof AppError) { throw error; } // Relança AppErrors (404, 400, 409, ou do repo)
        console.error(`[EstadoService.updateEstado] Erro inesperado ao atualizar estado ${id}:`, error);
        throw new AppError(`Erro ao atualizar o estado ${id}.`, 500, false);
    }
  }

  async deleteEstado(id: number): Promise<void> {
     try {
        // Poderia verificar a existência antes com getEstadoById(id) se quisesse garantir o 404 aqui.
        // Mas o repositório já retorna false se não encontrou.
        const deleted = await this.estadoRepository.delete(id);

        if (!deleted) {
            // Se o repositório retorna false, significa que o estado não foi encontrado para deletar.
            throw new AppError('Estado não encontrado para exclusão.', 404); // 404 Not Found
        }
        // Se chegou aqui, deletou com sucesso (void não tem retorno)
     } catch (error: any) {
         if (error instanceof AppError) { throw error; } // Relança AppErrors (como o 404 acima, ou 409 do repo se houver FK)
         console.error(`[EstadoService.deleteEstado] Erro inesperado ao deletar estado ${id}:`, error);
         throw new AppError(`Erro ao excluir o estado ${id}.`, 500, false);
     }
  }
}