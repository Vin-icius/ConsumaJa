import { Categoria } from "../../domain/entities/categoria.entity";
import { CategoriaRepository } from "../../domain/repositories/categoria-produto.repository";

export class CategoriaService {
  constructor(private categoriaRepository: CategoriaRepository) {}

  async criarCategoria(categoria: Categoria): Promise<Categoria> {
    return this.categoriaRepository.criar(categoria);
  }

  async listarCategorias(): Promise<Categoria[]> {
    return this.categoriaRepository.listar();
  }

  async buscarCategoriaPorId(id: number): Promise<Categoria | null> {
    return this.categoriaRepository.buscarPorId(id);
  }

  async atualizarCategoria(categoria: Categoria): Promise<Categoria> {
    return this.categoriaRepository.atualizar(categoria);
  }

  async excluirCategoria(id: number): Promise<void> {
    return this.categoriaRepository.excluir(id);
  }
}