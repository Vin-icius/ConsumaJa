import { LoteProd } from "../entities/loteprod.entity"; // Sua entidade LoteProd
import { CreateLoteProdDto } from "../../interfaces/dtos/create-loteprod.dto"; // Usado para definir CreateLoteProdRepoData
import { UpdateLoteProdDto } from "../../interfaces/dtos/update-loteprod.dto";
import { ListarLotesQueryDto } from "../../interfaces/dtos/listar-lotes-query.dto"; // Novo DTO para listagem geral


export interface PaginatedRepositoryResponse<T> {
    data: T[];
    total: number;
  }
  
  export interface ListarLotesDisponiveisFiltros {
      produtoId?: number;
      fornecedorId?: number;
      produtoNomeQuery?: string;
      apenasComEstoque?: boolean;
      apenasNaoVencidos?: boolean;
  }

// Dados que o repositório espera para CRIAR um lote
export type CreateLoteProdRepoData = Omit<CreateLoteProdDto, 'lote_validade' | 'lote_quantidade_atual'> & {
    lote_validade: Date; // Serviço converterá string para Date
    lote_quantidade_atual: number; // Serviço definirá se não vier no DTO
    ativo: boolean; // Serviço definirá como true por padrão
    data_entrada: Date; // Serviço definirá como new Date()
    fornecedor_pessoa_id: number;
};

// Dados que o repositório espera para ATUALIZAR um lote
export type UpdateLoteProdRepoData = Omit<UpdateLoteProdDto, 'lote_validade'> & {
    lote_validade?: Date; // Opcional e Date
};


export interface LoteProdRepository {
    criar(data: CreateLoteProdRepoData): Promise<LoteProd>;
    listar(filtros: ListarLotesQueryDto): Promise<PaginatedRepositoryResponse<LoteProd>>; // Listagem geral ADM
    buscarPorId(lote_id: number, apenasAtivo?: boolean): Promise<LoteProd | null>;
    atualizar(lote_id: number, data: UpdateLoteProdRepoData): Promise<LoteProd | null>;
    excluir(lote_id: number): Promise<boolean>; // Exclusão lógica (seta ativo = false)

    // Método específico para buscar lotes para adicionar em promoções
    listarDisponiveis(filtros: ListarLotesDisponiveisFiltros): Promise<LoteProd[]>;
    decrementarEstoque(lote_id: number, quantidade: number): Promise<boolean>;
    // Encontrar por código de lote e produto_id para unicidade
    findByCodigoAndProdutoId(lote_codigo: string, produto_id: number): Promise<LoteProd | null>;
}