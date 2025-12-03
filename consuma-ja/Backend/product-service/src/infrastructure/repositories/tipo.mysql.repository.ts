import { Tipo } from "../../domain/entities/tipo.entity";
import { TipoRepository, CreateTipoData, UpdateTipoData } from "../../domain/repositories/tipo-produto.repository";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Tipagem para a linha do banco
interface TipoRow extends Tipo, RowDataPacket {}

export class TipoMySQLRepository implements TipoRepository {

  // Helper para mapear linha do DB para entidade
  private mapRowToTipo(row: TipoRow): Tipo {
      const tipo: Tipo = {
          tipo_id: row.tipo_id,
          tipo_nome: row.tipo_nome,
          fornecedor_pessoa_id: row.fornecedor_pessoa_id ?? null,
          ativo: Boolean(row.ativo),
      };
      return tipo;
  }

  async findByNome(nome: string, fornecedorId?: number | null): Promise<Tipo | null> {
      let query = "SELECT * FROM TIPO_PRODUTO WHERE tipo_nome = ? AND ativo = TRUE";
      const params: Array<string | number> = [nome];

      if (fornecedorId === null) {
          query += " AND fornecedor_pessoa_id IS NULL";
      } else if (typeof fornecedorId === 'number') {
          query += " AND fornecedor_pessoa_id = ?";
          params.push(fornecedorId);
      }

      query += " LIMIT 1";
      try {
          if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
          const [rows] = await pool.query<TipoRow[]>(query, params);
          return rows.length > 0 ? this.mapRowToTipo(rows[0]) : null;
      } catch (error: any) {
           console.error("[Repo] Erro ao buscar tipo por nome:", error);
           throw new AppError("Erro no banco de dados ao buscar tipo.", 500, false);
      }
  }

  async criar(data: CreateTipoData): Promise<Tipo> {
    const { tipo_nome, fornecedor_pessoa_id } = data;
    const query = "INSERT INTO TIPO_PRODUTO (tipo_nome, fornecedor_pessoa_id) VALUES (?, ?)";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [result] = await pool.query<ResultSetHeader>(query, [tipo_nome, fornecedor_pessoa_id ?? null]);
        const insertedId = result.insertId;
        const novoTipo = await this.buscarPorId(insertedId, true);
        if (!novoTipo) {
            throw new AppError("Falha ao buscar tipo após criação.", 500, false);
        }
        return novoTipo;
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new AppError(`O tipo "${tipo_nome}" já existe.`, 409);
        }
        console.error("[Repo] Erro ao criar tipo:", error);
        throw new AppError("Erro no banco de dados ao criar tipo.", 500, false);
    }
  }

  async listar(apenasAtivos = true): Promise<Tipo[]> {
    let query = "SELECT * FROM TIPO_PRODUTO";
    if (apenasAtivos) {
        query += " WHERE ativo = TRUE";
    }
    query += " ORDER BY tipo_nome"; // Ordena alfabeticamente
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [rows] = await pool.query<TipoRow[]>(query);
        return rows.map(this.mapRowToTipo);
    } catch (error: any) {
         console.error("[Repo] Erro ao listar tipos:", error);
         throw new AppError("Erro no banco de dados ao listar tipos.", 500, false);
    }
  }

  async buscarPorId(id: number, incluirInativos = false): Promise<Tipo | null> {
    let query = "SELECT * FROM TIPO_PRODUTO WHERE tipo_id = ?";
    if (!incluirInativos) {
        query += " AND ativo = TRUE";
    }
     try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [rows] = await pool.query<TipoRow[]>(query, [id]);
        return rows.length > 0 ? this.mapRowToTipo(rows[0]) : null;
     } catch (error: any) {
         console.error(`[Repo] Erro ao buscar tipo ${id}:`, error);
         throw new AppError(`Erro no banco de dados ao buscar tipo ${id}.`, 500, false);
     }
  }

  async atualizar(id: number, data: UpdateTipoData): Promise<Tipo | null> {
    const { tipo_nome } = data;
    // Se 'tipo_nome' não foi passado, não há o que atualizar
    if (tipo_nome === undefined) {
        return this.buscarPorId(id);
    }

    // Query para atualizar apenas se estiver ativo
    const query = "UPDATE TIPO_PRODUTO SET tipo_nome = ? WHERE tipo_id = ? AND ativo = TRUE";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [result] = await pool.query<ResultSetHeader>(query, [tipo_nome, id]);

        if (result.affectedRows === 0) {
            const existe = await this.buscarPorId(id, true);
            return existe && existe.ativo ? existe : null;
        }

        const tipoAtualizado = await this.buscarPorId(id);
         if (!tipoAtualizado) { // Checagem de segurança
             throw new AppError("Falha ao buscar tipo após atualização bem-sucedida.", 500, false);
         }
        return tipoAtualizado;
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') { // Tentou atualizar para nome duplicado
            throw new AppError(`O nome de tipo "${tipo_nome}" já está em uso.`, 409);
        }
        console.error(`[Repo] Erro ao atualizar tipo ${id}:`, error);
        throw new AppError(`Erro no banco de dados ao atualizar tipo ${id}.`, 500, false);
    }
  }

  // Implementa EXCLUSÃO LÓGICA
  async excluir(id: number): Promise<boolean> {
    // Verifica se existe e está ativo antes de tentar desativar
    const tipoAtual = await this.buscarPorId(id, false);
    if (!tipoAtual) {
        return false;
    }

    const query = "UPDATE TIPO_PRODUTO SET ativo = FALSE WHERE tipo_id = ?";
    try {
        if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
        const [result] = await pool.query<ResultSetHeader>(query, [id]);
        return result.affectedRows > 0;
    } catch (error: any) {
         console.error(`[Repo] Erro ao excluir logicamente tipo ${id}:`, error);
         throw new AppError(`Erro no banco de dados ao excluir tipo ${id}.`, 500, false);
    }
  }
}