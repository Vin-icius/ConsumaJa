import { Marca } from "../../domain/entities/marca.entity";
import { MarcaRepository, CreateMarcaData, UpdateMarcaData } from "../../domain/repositories/marca-produto.repository";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface MarcaRow extends Marca, RowDataPacket {}

export class MarcaMySQLRepository implements MarcaRepository {

  private mapRowToMarca(row: MarcaRow): Marca {
      const marca: Marca = {
          marca_id: row.marca_id,
          marca_nome: row.marca_nome,
          ativo: Boolean(row.ativo),
      };
      return marca;
  }

  async findByNome(nome: string): Promise<Marca | null> {
      const query = "SELECT * FROM MARCA_PRODUTO WHERE marca_nome = ? AND ativo = TRUE LIMIT 1";
      try {
          if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
          const [rows] = await pool.query<MarcaRow[]>(query, [nome]);
          return rows.length > 0 ? this.mapRowToMarca(rows[0]) : null;
      } catch (error: any) {
           console.error("[Repo] Erro ao buscar marca por nome:", error);
           throw new AppError("Erro no banco de dados ao buscar marca.", 500, false);
      }
  }

  async criar(data: CreateMarcaData): Promise<Marca> {
    const { marca_nome } = data;
    const query = "INSERT INTO MARCA_PRODUTO (marca_nome) VALUES (?)";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [result] = await pool.query<ResultSetHeader>(query, [marca_nome]);
        const insertedId = result.insertId;
        const novaMarca = await this.buscarPorId(insertedId, true);
        if (!novaMarca) throw new AppError("Falha ao buscar marca após criação.", 500, false);
        return novaMarca;
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') { throw new AppError(`A marca "${marca_nome}" já existe.`, 409); }
        console.error("[Repo] Erro ao criar marca:", error);
        throw new AppError("Erro no banco de dados ao criar marca.", 500, false);
    }
  }

  async listar(apenasAtivos = true): Promise<Marca[]> {
    let query = "SELECT * FROM MARCA_PRODUTO";
    if (apenasAtivos) { query += " WHERE ativo = TRUE"; }
    query += " ORDER BY marca_nome";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [rows] = await pool.query<MarcaRow[]>(query);
        return rows.map(this.mapRowToMarca);
    } catch (error: any) {
         console.error("[Repo] Erro ao listar marcas:", error);
         throw new AppError("Erro no banco de dados ao listar marcas.", 500, false);
    }
  }

  async buscarPorId(id: number, incluirInativos = false): Promise<Marca | null> {
    let query = "SELECT * FROM MARCA_PRODUTO WHERE marca_id = ?";
    if (!incluirInativos) { query += " AND ativo = TRUE"; }
     try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [rows] = await pool.query<MarcaRow[]>(query, [id]);
        return rows.length > 0 ? this.mapRowToMarca(rows[0]) : null;
     } catch (error: any) {
         console.error(`[Repo] Erro ao buscar marca ${id}:`, error);
         throw new AppError(`Erro no banco de dados ao buscar marca ${id}.`, 500, false);
     }
  }

  async atualizar(id: number, data: UpdateMarcaData): Promise<Marca | null> {
    const { marca_nome } = data;
    if (marca_nome === undefined) return this.buscarPorId(id);

    const query = "UPDATE MARCA_PRODUTO SET marca_nome = ? WHERE marca_id = ? AND ativo = TRUE";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [result] = await pool.query<ResultSetHeader>(query, [marca_nome, id]);
        if (result.affectedRows === 0) {
            const existe = await this.buscarPorId(id, true);
            return existe && existe.ativo ? existe : null;
        }
        return await this.buscarPorId(id);
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') { throw new AppError(`O nome de marca "${marca_nome}" já está em uso.`, 409); }
        console.error(`[Repo] Erro ao atualizar marca ${id}:`, error);
        throw new AppError(`Erro no banco de dados ao atualizar marca ${id}.`, 500, false);
    }
  }

  // Exclusão lógica
  async excluir(id: number): Promise<boolean> {
    const marcaAtual = await this.buscarPorId(id, false);
    if (!marcaAtual) return false;

    const query = "UPDATE MARCA_PRODUTO SET ativo = FALSE WHERE marca_id = ?";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [result] = await pool.query<ResultSetHeader>(query, [id]);
        return result.affectedRows > 0;
    } catch (error: any) {
         console.error(`[Repo] Erro ao excluir logicamente marca ${id}:`, error);
         throw new AppError(`Erro no banco de dados ao excluir marca ${id}.`, 500, false);
    }
  }
}