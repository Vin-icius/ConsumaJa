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

  async listarPendentes(): Promise<Produto[]> {
    return this.produtoRepository.listarPendentes();
  }

  async excluirProduto(id: number): Promise<void> {
    await this.produtoRepository.excluir(id);
  }

  async aprovarProduto(produtoId: number): Promise<void> {
    const produto = await this.produtoRepository.buscarPorId(produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    produto.status = 'APROVADO';
    await this.produtoRepository.aprovar(produto.id);
  }

  async rejeitarProduto(produtoId: number, motivoRejeicao: string): Promise<void> {
    const produto = await this.produtoRepository.buscarPorId(produtoId);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    produto.status = 'REJEITADO';
    produto.motivo = motivoRejeicao;
    await this.produtoRepository.rejeitar(produto.id, produto.motivo);
  }
}