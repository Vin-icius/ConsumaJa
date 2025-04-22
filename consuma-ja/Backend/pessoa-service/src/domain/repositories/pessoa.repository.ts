import { Pessoa, PessoaTipo } from "../entities/pessoa.entity";
import { Fisica } from "../entities/fisica.entity";
import { Juridica } from "../entities/juridica.entity";

// --- Tipos Auxiliares ---
type CreateFisicaInput = Omit<Fisica, 'PESSOA_pessoa_id' | 'pessoa_documentoValidado' | 'pessoa_fotoValidada'>;

type CreateJuridicaInput = Omit<Juridica, 'PESSOA_pessoa_id'>;

export type CreatePessoaData =
    Omit<Pessoa,
        'pessoa_id' |
        'data_criacao' |
        'ativo' |
        'fisica' |
        'juridica'
    >
    & { 
        fisicaData?: CreateFisicaInput;
        juridicaData?: CreateJuridicaInput;
        pessoa_senha: string;
    };

export type UpdatePessoaData = Partial<Pick<Pessoa,
    'pessoa_nome' |
    'pessoa_email' |
    'pessoa_telefone' |
    'pessoa_senha' | // Senha PODE ser atualizada (será hashada no serviço)
    'pessoa_status'  // Status PODE ser atualizado (para ativar/inativar logicamente)
    
>>;


// --- Interface do Repositório ---

export interface PessoaRepository {
    findById(id: number): Promise<Pessoa | null>;
    findByLoginOrEmailOrDoc(identifier: string): Promise<Pessoa | null>;
    findByEmail(email: string): Promise<Pick<Pessoa, 'pessoa_id'> | null>; // Retorna só ID se achar
    findByLogin(login: string): Promise<Pick<Pessoa, 'pessoa_id'> | null>;
    criar(data: CreatePessoaData): Promise<Pessoa>;
    atualizar(id: number, data: UpdatePessoaData): Promise<Pessoa | null>;
    excluir(id: number): Promise<boolean>;
    listar(filtros?: any): Promise<Pessoa[]>;
}