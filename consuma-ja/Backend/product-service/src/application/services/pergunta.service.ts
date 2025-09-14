import { Pergunta } from '../../domain/entities/pergunta.entity';
import { PerguntaRepository } from '../../domain/repositories/pergunta.repository';

export class PerguntaService {
    constructor(private perguntaRepository: PerguntaRepository) {}

    async listarAtivas(): Promise<Pergunta[]> {
        return this.perguntaRepository.listarAtivas();
    }
}