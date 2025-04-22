import { Categoria } from "../../domain/entities/categoria.entity";
import { CategoriaRepository, CreateCategoriaData, UpdateCategoriaData } from "../../domain/repositories/categoria-produto.repository";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface CategoriaRow extends Categoria, RowDataPacket {}

export class CategoriaMySQLRepository implements CategoriaRepository {

  // Helper para mapear linha do DB para entidade
  private mapRowToCategoria(row: CategoriaRow): Categoria {
      const categoria: Categoria = {
          categoria_id: row.categoria_id,
          categoria_nome: row.categoria_nome,
          ativo: Boolean(row.ativo),
      };
      return categoria; // Retorna a variável tipada
      // ------------------------------------------------------------------
  }

  async findByNome(nome: string): Promise<Categoria | null> {
      // console.log('[Repo Categoria - findByNome] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
      const query = "SELECT * FROM CATEGORIA_PRODUTO WHERE categoria_nome = ? AND ativo = TRUE LIMIT 1";
      try {
          if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
          const [rows] = await pool.query<CategoriaRow[]>(query, [nome]);
          return rows.length > 0 ? this.mapRowToCategoria(rows[0]) : null;
      } catch (error: any) {
           console.error("[Repo] Erro ao buscar categoria por nome:", error);
           throw new AppError("Erro no banco de dados ao buscar categoria.", 500, false);
      }
  }

  async criar(data: CreateCategoriaData): Promise<Categoria> {
    // console.log('[Repo Categoria - criar] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
    const { categoria_nome } = data;
    const query = "INSERT INTO CATEGORIA_PRODUTO (categoria_nome) VALUES (?)";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [result] = await pool.query<ResultSetHeader>(query, [categoria_nome]);
        const insertedId = result.insertId;
        const novaCategoria = await this.buscarPorId(insertedId, true);
        if (!novaCategoria) throw new AppError("Falha ao buscar categoria após criação.", 500, false);
        return novaCategoria;
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') { throw new AppError(`A categoria "${categoria_nome}" já existe.`, 409); }
        console.error("[Repo] Erro ao criar categoria:", error);
        throw new AppError("Erro no banco de dados ao criar categoria.", 500, false);
    }
  }

  async listar(apenasAtivos = true): Promise<Categoria[]> {
    // console.log('[Repo Categoria - listar] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
    let query = "SELECT * FROM CATEGORIA_PRODUTO";
    if (apenasAtivos) { query += " WHERE ativo = TRUE"; }
    query += " ORDER BY categoria_nome";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [rows] = await pool.query<CategoriaRow[]>(query);
        return rows.map(this.mapRowToCategoria);
    } catch (error: any) {
         console.error("[Repo] Erro ao listar categorias:", error);
         throw new AppError("Erro no banco de dados ao listar categorias.", 500, false);
    }
  }

  async buscarPorId(id: number, incluirInativos = false): Promise<Categoria | null> {
      // console.log('[Repo Categoria - buscarPorId] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
      let query = "SELECT * FROM CATEGORIA_PRODUTO WHERE categoria_id = ?";
      if (!incluirInativos) { query += " AND ativo = TRUE"; }
      try {
          if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
          const [rows] = await pool.query<CategoriaRow[]>(query, [id]);
          return rows.length > 0 ? this.mapRowToCategoria(rows[0]) : null;
      } catch (error: any) {
           console.error(`[Repo] Erro ao buscar categoria ${id}:`, error);
           throw new AppError(`Erro no banco de dados ao buscar categoria ${id}.`, 500, false);
      }
  }

  async atualizar(id: number, data: UpdateCategoriaData): Promise<Categoria | null> {
      // console.log('[Repo Categoria - atualizar] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
      const { categoria_nome } = data;
      if (categoria_nome === undefined) { return this.buscarPorId(id); }

      const query = "UPDATE CATEGORIA_PRODUTO SET categoria_nome = ? WHERE categoria_id = ? AND ativo = TRUE";
      try {
          if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
          const [result] = await pool.query<ResultSetHeader>(query, [categoria_nome, id]);
          if (result.affectedRows === 0) {
              const existe = await this.buscarPorId(id, true);
              return existe && existe.ativo ? existe : null;
          }
          return await this.buscarPorId(id);
      } catch (error: any) {
          if (error.code === 'ER_DUP_ENTRY') { throw new AppError(`O nome de categoria "${categoria_nome}" já está em uso.`, 409); }
          console.error(`[Repo] Erro ao atualizar categoria ${id}:`, error);
          throw new AppError(`Erro no banco de dados ao atualizar categoria ${id}.`, 500, false);
      }
  }

  async excluir(id: number): Promise<boolean> {
      // console.log('[Repo Categoria - excluir] Verificando pool:', pool ? 'DEFINIDO' : '!!! INDEFINIDO !!!');
      const categoriaAtual = await this.buscarPorId(id, false);
      if (!categoriaAtual) { return false; }

      const query = "UPDATE CATEGORIA_PRODUTO SET ativo = FALSE WHERE categoria_id = ?";
      try {
          if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
          const [result] = await pool.query<ResultSetHeader>(query, [id]);
          return result.affectedRows > 0;
      } catch (error: any) {
           console.error(`[Repo] Erro ao excluir logicamente categoria ${id}:`, error);
           throw new AppError(`Erro no banco de dados ao excluir categoria ${id}.`, 500, false);
      }
  }
}