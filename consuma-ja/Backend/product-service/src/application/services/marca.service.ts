import { Marca } from "../../domain/entities/marca.entity";
import { MarcaRepository } from "../../domain/repositories/marca-produto.repository";

export class MarcaService {
  constructor(private marcaRepository: MarcaRepository) {}

  async criarMarca(marca: Marca): Promise<Marca> {
    return this.marcaRepository.criar(marca);
  }

  async listarMarcas(): Promise<Marca[]> {
    return this.marcaRepository.listar();
  }

  async buscarMarcaPorId(id: number): Promise<Marca | null> {
    return this.marcaRepository.buscarPorId(id);
  }

  async atualizarMarca(marca: Marca): Promise<Marca> {
    return this.marcaRepository.atualizar(marca);
  }

  async excluirMarca(id: number): Promise<void> {
    return this.marcaRepository.excluir(id);
  }
}