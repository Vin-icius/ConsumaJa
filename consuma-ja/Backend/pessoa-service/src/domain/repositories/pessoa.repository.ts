import { Pessoa, PessoaTipo } from "../entities/pessoa.entity";
import { Fisica } from "../entities/fisica.entity";
import { Juridica } from "../entities/juridica.entity";

// --- Tipos Auxiliares (Mantidos aqui) ---
type CreateFisicaInput = Pick<Fisica, 'pessoa_cpf'>;
type CreateJuridicaInput = Pick<Juridica, 'cnpj' | 'fornecedor_num'>;

export type CreatePessoaData =
    Omit<Pessoa, 'pessoa_id' | 'data_criacao' | 'ativo' | 'fisica' | 'juridica' >
    & { fisicaData?: CreateFisicaInput; juridicaData?: CreateJuridicaInput; pessoa_senha: string; };

export type UpdatePessoaData = Partial<Pick<Pessoa,
    'pessoa_nome' | 'pessoa_email' | 'pessoa_telefone' | 'pessoa_senha' | 'pessoa_status'
>>;

export interface PessoaRepository {
    findById(id: number): Promise<Pessoa | null>;
    findByLoginOrEmailOrDoc(identifier: string): Promise<Pessoa | null>;
    findByEmail(email: string): Promise<Pick<Pessoa, 'pessoa_id'> | null>;
    findByLogin(login: string): Promise<Pick<Pessoa, 'pessoa_id'> | null>;

    criar(data: CreatePessoaData): Promise<Pessoa>;
    atualizar(id: number, data: UpdatePessoaData): Promise<Pessoa | null>;
    excluir(id: number): Promise<boolean>; // Exclusão Lógica
    atualizarCaminhosFotos(pessoaId: number, paths: { foto_selfie_path?: string; foto_documento_path?: string }): Promise<boolean>;
    listar(apenasAtivos?: boolean): Promise<Pessoa[]>; // Método Listar
}