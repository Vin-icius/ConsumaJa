import { Produto } from "../entities/produto.entity";
<<<<<<< HEAD
=======
import { ListarProdutosSelecaoQueryDto } from "../../interfaces/dtos/listar-produtos-selecao-query.dto";
import { ListarProdutosQueryDto } from "../../interfaces/dtos/listar-produtos-query.dto";

export interface PaginatedRepositoryResponse<T> {
  data: T[];
  total: number;
}
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)

// Dados para criação: Inclui FKs, omite IDs/Datas/Status/Ativo/Objetos relacionados
export type CreateProdutoData = Omit<Produto,
  'produto_id' | 'produto_status' | 'motivo' | 'data_registro' |
  'data_aprovacao' | 'data_exclusao' | 'ativo' |
  'categoria' | 'marca' | 'tipo'
>;

// Dados para atualização: Parcial, permite alterar campos editáveis
export type UpdateProdutoData = Partial<Omit<Produto,
  'produto_id' | 'produto_status' | 'motivo' | 'data_registro' |
  'data_aprovacao' | 'data_exclusao' | 'ativo' |
  'categoria' | 'marca' | 'tipo' // Não permite mudar FKs diretamente aqui
>>;

export interface ProdutoRepository {

    criar(data: CreateProdutoData): Promise<Produto>;
<<<<<<< HEAD
    listar(apenasAtivos?: boolean, filtros?: any): Promise<Produto[]>;
=======
    listar(filtros: ListarProdutosQueryDto): Promise<PaginatedRepositoryResponse<Produto>>;
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
    buscarPorId(id: number, incluirInativos?: boolean): Promise<Produto | null>;
    atualizar(id: number, data: UpdateProdutoData): Promise<Produto | null>;
    excluir(id: number): Promise<boolean>;

    // Métodos específicos do fluxo de aprovação
    listarPendentes(apenasAtivos?: boolean): Promise<Produto[]>;
    aprovar(id: number): Promise<Produto | null>;
    rejeitar(id: number, motivo: string): Promise<Produto | null>;
    findByNome(nome: string): Promise<Produto | null>;
<<<<<<< HEAD
=======

    // --- Método para Formulário de Promoção ---
    listarParaSelecaoPromocao(
      filtros: ListarProdutosSelecaoQueryDto
    ): Promise<PaginatedRepositoryResponse<Pick<Produto, "produto_id" | "produto_nome" | "produto_imagem_url">>>;
>>>>>>> ba4043b (feat: criacao do gerenciamento de lotes e promocoes, refatoramento da tela de inicio)
}