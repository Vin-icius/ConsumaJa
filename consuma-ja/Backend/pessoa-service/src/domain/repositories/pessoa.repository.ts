import { Pessoa, PessoaTipo } from "../entities/pessoa.entity";
import { Fisica } from "../entities/fisica.entity";
import { Juridica } from "../entities/juridica.entity";
import { ListarPessoasQueryDto } from "../../interfaces/dtos/listar-pessoas-query.dto";

// --- Tipos Auxiliares (Mantidos aqui) ---
type CreateFisicaInput = Pick<Fisica, 'pessoa_cpf'>;
type CreateJuridicaInput = Pick<Juridica, 'cnpj' | 'fornecedor_num'>;

export interface PaginatedRepositoryResponse<T> {
    data: T[];
    total: number; // Total de itens que correspondem ao filtro (sem paginação)
  }

  export type CreatePessoaData =
  Omit<Pessoa, 'pessoa_id' | 'data_criacao' | 'ativo' | 'fisica' | 'juridica' | 'enderecos'> // Omitir 'enderecos' se for um array na entidade Pessoa
  & {
      fisicaData?: CreateFisicaInput;
      juridicaData?: CreateJuridicaInput;
      pessoa_senha: string; // Senha em texto plano, será hashada no serviço
      // Adicionar campos de endereço que virão do DTO e serão salvos na tabela ENDERECO
      cep: string;
      rua: string;
      bairro: string;
      numero: string;
      complemento?: string | null;
      CIDADE_cidade_id: number;
      // pessoa_status é tratado internamente no repo/serviço
  };

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
    atualizarEndereco(pessoaId: number, enderecoData: {
        endereco_cep?: string;
        endereco_rua?: string;
        endereco_numero?: string;
        endereco_complemento?: string | null;
        endereco_bairro?: string;
        cidade_id?: number;
    }): Promise<boolean>;
    excluir(id: number): Promise<boolean>; // Exclusão Lógica
    atualizarCaminhosFotos(pessoaId: number, paths: { foto_selfie_path?: string; foto_documento_path?: string }): Promise<boolean>;
    listar(filtros: ListarPessoasQueryDto): Promise<PaginatedRepositoryResponse<Pessoa>>;
}