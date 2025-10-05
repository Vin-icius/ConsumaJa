import { Pergunta } from "../entities/pergunta.entity";

// Interface para os dados de criação
export interface CreatePerguntaData {
    perguntas_descricao: string;
    ativo: boolean;
}

// Interface para os dados de atualização
export interface UpdatePerguntaData {
    perguntas_descricao?: string;
    ativo?: boolean;
}

export interface PerguntaRepository {
    // Lista todas as perguntas para o painel de gerenciamento
    listarTodas(): Promise<Pergunta[]>;
    
    // Lista apenas as perguntas ativas para o formulário do cliente (já existe)
    listarAtivas(): Promise<Pergunta[]>;

    // Busca uma única pergunta por ID
    buscarPorId(id: number): Promise<Pergunta | null>;

    // Cria uma nova pergunta
    criar(data: CreatePerguntaData): Promise<Pergunta>;

    // Atualiza uma pergunta existente
    atualizar(id: number, data: UpdatePerguntaData): Promise<Pergunta | null>;

    excluir(id: number): Promise<boolean>;
}