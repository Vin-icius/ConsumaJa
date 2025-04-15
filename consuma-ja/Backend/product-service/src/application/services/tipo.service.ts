import { Tipo } from "../../domain/entities/tipo.entity";
import { TipoRepository } from "../../domain/repositories/tipo-produto.repository";

export class TipoService {
  constructor(private tipoRepository: TipoRepository) {}

  async criarTipo(tipo: Tipo): Promise<Tipo> {
    return this.tipoRepository.criar(tipo);
  }

  async listarTipos(): Promise<Tipo[]> {
    return this.tipoRepository.listar();
  }

  async buscarTipoPorId(id: number): Promise<Tipo | null> {
    return this.tipoRepository.buscarPorId(id);
  }

  async atualizarTipo(tipo: Tipo): Promise<Tipo> {
    return this.tipoRepository.atualizar(tipo);
  }

  async excluirTipo(id: number): Promise<void> {
    return this.tipoRepository.excluir(id);
  }
}