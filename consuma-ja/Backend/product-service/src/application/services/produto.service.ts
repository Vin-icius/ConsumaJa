import { Produto } from "../../domain/entities/produto.entity";
import { ProdutoRepository } from "../../domain/repositories/produto.repository";


export class ProdutoService {
  constructor(private produtoRepository: ProdutoRepository) {}

  async criarProduto(produto: Produto): Promise<Produto> {
    return this.produtoRepository.criar(produto);
  }

  async atualizarProduto(produto: Produto): Promise<Produto> {
    return this.produtoRepository.atualizar(produto);
  }

  async buscarProdutoPorId(id: number): Promise<Produto | null> {
    return this.produtoRepository.buscarPorId(id);
  }

  async listarProdutos(): Promise<Produto[]> {
    return this.produtoRepository.listar();
  }

  async excluirProduto(id: number): Promise<void> {
    await this.produtoRepository.excluir(id);
  }
}