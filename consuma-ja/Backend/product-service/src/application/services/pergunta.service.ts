import { Pergunta } from '../../domain/entities/pergunta.entity';
import { PerguntaRepository } from '../../domain/repositories/pergunta.repository';

const DEFAULT_PERGUNTA_DESCRICAO = 'Como você avalia sua experiência geral com a compra?';

export class PerguntaService {
    constructor(private perguntaRepository: PerguntaRepository) {}

    async listarAtivas(): Promise<Pergunta[]> {
        const perguntas = await this.perguntaRepository.listarAtivas();
        if (perguntas.length > 0) {
            return perguntas;
        }

        const fallback = await this.perguntaRepository.obterOuCriarPerguntaPadrao(DEFAULT_PERGUNTA_DESCRICAO);
        return [fallback];
    }
}