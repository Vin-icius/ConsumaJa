import { Produto } from '../entities/produto.entity';

export interface ProdutoRepository {
  criar(produto: Produto): Promise<Produto>;
  atualizar(produto: Produto): Promise<Produto>;
  buscarPorId(id: number): Promise<Produto | null>;
  listar(): Promise<Produto[]>;
  listarPendentes(): Promise<Produto[]>;
  excluir(id: number): Promise<void>;
  //aprovar e rejeitar ou atualizar?
  aprovar(produtoId: number): Promise<void>;
  rejeitar(produtoId: number, motivoRejeicao: string): Promise<void>;
}