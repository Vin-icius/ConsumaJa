import { Pergunta } from "../entities/pergunta.entity";

export interface PerguntaRepository {
    listarAtivas(): Promise<Pergunta[]>;
}