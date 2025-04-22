import { Marca } from "../../domain/entities/marca.entity";
import { MarcaRepository } from "../../domain/repositories/marca-produto.repository";
import { AppError } from "../../common/errors/app-error";
import { CreateMarcaDto } from "../../interfaces/dtos/create-marca.dto";
import { UpdateMarcaDto } from "../../interfaces/dtos/update-marca.dto";

export class MarcaService {
  constructor(private marcaRepository: MarcaRepository) {}

  async criarMarca(createDto: CreateMarcaDto): Promise<Marca> {
      const nomeExistente = await this.marcaRepository.findByNome(createDto.marca_nome);
      if (nomeExistente) {
          throw new AppError(`A marca "${createDto.marca_nome}" já existe (ID: ${nomeExistente.marca_id}).`, 409);
      }
      try {
          const novaMarca = await this.marcaRepository.criar(createDto);
          return novaMarca;
      } catch (error) { /* ... tratamento genérico ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno...", 500, false);}
  }

  async listarMarcas(): Promise<Marca[]> {
      try {
          return await this.marcaRepository.listar(true);
      } catch (error) { /* ... tratamento genérico ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno...", 500, false);}
  }

  async buscarMarcaPorId(id: number): Promise<Marca> {
      try {
         const marca = await this.marcaRepository.buscarPorId(id, false);
         if (!marca) { throw new AppError(`Marca com ID ${id} não encontrada ou inativa.`, 404); }
         return marca;
      } catch (error) { /* ... tratamento genérico ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno...", 500, false);}
  }

  async atualizarMarca(id: number, updateDto: UpdateMarcaDto): Promise<Marca> {
      const marcaExistente = await this.buscarMarcaPorId(id);
      if (updateDto.marca_nome && updateDto.marca_nome !== marcaExistente.marca_nome) {
          const outroComNome = await this.marcaRepository.findByNome(updateDto.marca_nome);
          if (outroComNome && outroComNome.marca_id !== id) {
               throw new AppError(`O nome de marca "${updateDto.marca_nome}" já está em uso.`, 409);
          }
      }
      try {
          const marcaAtualizada = await this.marcaRepository.atualizar(id, updateDto);
          if (!marcaAtualizada) { throw new AppError(`Falha ao atualizar: Marca com ID ${id} não encontrada ou inativa.`, 404); }
          return marcaAtualizada;
      } catch (error) { /* ... tratamento genérico ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno...", 500, false);}
  }

  async excluirMarca(id: number): Promise<void> {
       try {
            const excluido = await this.marcaRepository.excluir(id);
            if (!excluido) { throw new AppError(`Marca com ID ${id} não encontrada ou já está inativa.`, 404); }
       } catch (error) { /* ... tratamento genérico ... */ if (error instanceof AppError) throw error; throw new AppError("Erro interno...", 500, false);}
  }
}