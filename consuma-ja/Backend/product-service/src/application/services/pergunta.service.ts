import { Pergunta } from '../../domain/entities/pergunta.entity';
import { PerguntaRepository, CreatePerguntaData, UpdatePerguntaData } from '../../domain/repositories/pergunta.repository';
import { AppError } from '../../common/errors/app-error';

export class PerguntaService {
    constructor(private perguntaRepository: PerguntaRepository) {}

    async listarAtivas(): Promise<Pergunta[]> {
        return this.perguntaRepository.listarAtivas();
    }

    async listarTodas(): Promise<Pergunta[]> {
        return this.perguntaRepository.listarTodas();
    }

    async criar(data: CreatePerguntaData): Promise<Pergunta> {
        if (!data.perguntas_descricao || data.perguntas_descricao.trim() === '') {
            throw new AppError("A descrição da pergunta é obrigatória.", 400);
        }
        return this.perguntaRepository.criar(data);
    }

    async atualizar(id: number, data: UpdatePerguntaData): Promise<Pergunta> {
        // A validação do ID e do corpo vazio agora está no controller
        const pergunta = await this.perguntaRepository.buscarPorId(id);
        if (!pergunta) {
            throw new AppError("Pergunta não encontrada.", 404);
        }
        
        const perguntaAtualizada = await this.perguntaRepository.atualizar(id, data);
        if (!perguntaAtualizada) {
            throw new AppError("Falha ao atualizar a pergunta.", 500);
        }
        return perguntaAtualizada;
    }

    async excluirLogico(id: number): Promise<void> {
        // A validação do ID agora está no controller
        const pergunta = await this.perguntaRepository.buscarPorId(id);
        if (!pergunta) {
            throw new AppError("Pergunta não encontrada.", 404);
        }

        const sucesso = await this.perguntaRepository.excluirLogico(id);
        if (!sucesso) {
            throw new AppError("Não foi possível desativar a pergunta.", 500);
        }
    }

    async excluirFisico(id: number): Promise<void> {
        if (isNaN(id)) {
            throw new AppError("ID da pergunta inválido.", 400);
        }
        const sucesso = await this.perguntaRepository.excluirFisico(id);
        if (!sucesso) {
            // Isso pode acontecer se o ID não for encontrado
            throw new AppError("Pergunta não encontrada para exclusão.", 404);
        }
    }
}