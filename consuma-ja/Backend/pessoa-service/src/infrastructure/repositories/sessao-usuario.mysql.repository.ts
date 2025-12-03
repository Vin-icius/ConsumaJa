import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import { SessaoUsuario, SessaoUsuarioCreate } from '../../domain/entities/sessao-usuario.entity';
import { SessaoUsuarioRepository } from '../../domain/repositories/sessao-usuario.repository';
import { pool } from '../database/mysql.connection';
import { AppError } from '../../common/errors/app-error';

interface SessaoUsuarioRow extends RowDataPacket {
  sessao_id: string;
  PESSOA_pessoa_id: number;
  token: string;
  dados_usuario: string | null;
  ativo: number;
  data_criacao: Date;
  ultima_validacao: Date;
  expira_em: Date;
}

interface TableColumnRow extends RowDataPacket {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  CHARACTER_MAXIMUM_LENGTH: number | null;
  COLUMN_TYPE: string;
  IS_NULLABLE: 'YES' | 'NO';
}

const mapRowToEntity = (row: SessaoUsuarioRow): SessaoUsuario => ({
  sessao_id: row.sessao_id,
  pessoa_id: row.PESSOA_pessoa_id,
  token: row.token,
  dados_usuario: (() => {
    if (typeof row.dados_usuario === 'string') {
      try {
        return JSON.parse(row.dados_usuario);
      } catch (error) {
        console.warn('[SessaoUsuarioRepository] Falha ao fazer parse de dados_usuario, retornando objeto vazio.', error);
        return {};
      }
    }

    if (row.dados_usuario && typeof row.dados_usuario === 'object') {
      return row.dados_usuario as Record<string, unknown>;
    }

    return {};
  })(),
  ativo: Boolean(row.ativo),
  data_criacao: new Date(row.data_criacao),
  ultima_validacao: new Date(row.ultima_validacao),
  expira_em: new Date(row.expira_em),
});

export class SessaoUsuarioMySQLRepository implements SessaoUsuarioRepository {
  private isMissingTableError(error: any): boolean {
    return error?.code === 'ER_NO_SUCH_TABLE';
  }

  private isUnknownColumnError(error: any): boolean {
    return error?.code === 'ER_BAD_FIELD_ERROR';
  }

  private isDataTruncationError(error: any): boolean {
    return error?.code === 'WARN_DATA_TRUNCATED' || error?.code === 'ER_DATA_TOO_LONG';
  }

  private async ensureTableExists(connection: PoolConnection): Promise<void> {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS SESSOES_USUARIO (
        sessao_id CHAR(36) NOT NULL PRIMARY KEY,
        PESSOA_pessoa_id INT UNSIGNED NOT NULL,
        token VARCHAR(512) NOT NULL,
        dados_usuario LONGTEXT NULL,
        ativo TINYINT(1) NOT NULL DEFAULT 1,
        data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ultima_validacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expira_em DATETIME NOT NULL,
        INDEX idx_sessoes_usuario_pessoa (PESSOA_pessoa_id ASC),
        CONSTRAINT fk_SESSOES_USUARIO_PESSOA1 FOREIGN KEY (PESSOA_pessoa_id) REFERENCES PESSOA (pessoa_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `);
  }

  private async ensureTableStructure(connection: PoolConnection): Promise<void> {
    const [columnRows] = await connection.query<TableColumnRow[]>(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'SESSOES_USUARIO'
    `);

    const existingColumns = new Map(columnRows.map((row) => [row.COLUMN_NAME.toLowerCase(), row]));
    const alterParts: string[] = [];

    const sessaoColumn = existingColumns.get('sessao_id');
    if (!sessaoColumn) {
      alterParts.push('ADD COLUMN sessao_id CHAR(36) NOT NULL PRIMARY KEY');
    } else {
      const isChar = sessaoColumn.DATA_TYPE.toLowerCase() === 'char';
      const length = sessaoColumn.CHARACTER_MAXIMUM_LENGTH ?? 0;
      if (!isChar || length < 36) {
        alterParts.push('MODIFY COLUMN sessao_id CHAR(36) NOT NULL');
      }
    }

    const tokenColumn = existingColumns.get('token');
    if (!tokenColumn) {
      alterParts.push("ADD COLUMN token VARCHAR(512) NOT NULL DEFAULT ''");
    } else {
      const isVarchar = tokenColumn.DATA_TYPE.toLowerCase() === 'varchar';
      const length = tokenColumn.CHARACTER_MAXIMUM_LENGTH ?? 0;
      if (!isVarchar || length < 512) {
        alterParts.push('MODIFY COLUMN token VARCHAR(512) NOT NULL');
      }
    }

    const dadosColumn = existingColumns.get('dados_usuario');
    if (!dadosColumn) {
      alterParts.push('ADD COLUMN dados_usuario LONGTEXT NULL');
    } else {
      const dataType = dadosColumn.DATA_TYPE.toLowerCase();
      if (!['longtext', 'json', 'text', 'mediumtext'].includes(dataType)) {
        alterParts.push('MODIFY COLUMN dados_usuario LONGTEXT NULL');
      }
    }

    const ativoColumn = existingColumns.get('ativo');
    if (!ativoColumn) {
      alterParts.push('ADD COLUMN ativo TINYINT(1) NOT NULL DEFAULT 1');
    } else {
      const isTinyInt = ativoColumn.DATA_TYPE.toLowerCase() === 'tinyint';
      if (!isTinyInt) {
        alterParts.push('MODIFY COLUMN ativo TINYINT(1) NOT NULL DEFAULT 1');
      }
    }

    if (!existingColumns.has('data_criacao')) {
      alterParts.push('ADD COLUMN data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP');
    }

    if (!existingColumns.has('ultima_validacao')) {
      alterParts.push('ADD COLUMN ultima_validacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    }

    if (!existingColumns.has('expira_em')) {
      alterParts.push('ADD COLUMN expira_em DATETIME NOT NULL');
    }

    if (alterParts.length === 0) {
      return;
    }

    const statement = `ALTER TABLE SESSOES_USUARIO ${alterParts.join(', ')}`;

    try {
      await connection.query(statement);
    } catch (error: any) {
      if (error?.code === 'ER_DUP_FIELDNAME') {
        return;
      }

      console.error('[SessaoUsuarioRepository] Falha ao ajustar estrutura da tabela SESSOES_USUARIO:', error);
      throw error;
    }
  }

  async criarSessao(payload: SessaoUsuarioCreate): Promise<SessaoUsuario> {
    const connection = await pool.getConnection();
    let attempt = 0;

    try {
      while (attempt < 3) {
        try {
          await connection.beginTransaction();

          await connection.query<ResultSetHeader>(
            'UPDATE SESSOES_USUARIO SET ativo = 0 WHERE PESSOA_pessoa_id = ?',
            [payload.pessoa_id],
          );

          await connection.query<ResultSetHeader>(
            `INSERT INTO SESSOES_USUARIO (sessao_id, PESSOA_pessoa_id, token, dados_usuario, ativo, expira_em)
             VALUES (?, ?, ?, ?, 1, ?)` ,
            [
              payload.sessao_id,
              payload.pessoa_id,
              payload.token,
              JSON.stringify(payload.dados_usuario ?? {}),
              payload.expira_em,
            ],
          );

          const [rows] = await connection.query<SessaoUsuarioRow[]>(
            'SELECT * FROM SESSOES_USUARIO WHERE sessao_id = ? LIMIT 1',
            [payload.sessao_id],
          );

          await connection.commit();

          if (!rows.length) {
            throw new AppError('Falha ao criar sessão do usuário.', 500, false);
          }

          return mapRowToEntity(rows[0]);
        } catch (error: any) {
          await connection.rollback();

          if (this.isMissingTableError(error)) {
            attempt += 1;
            await this.ensureTableExists(connection);
            await this.ensureTableStructure(connection);
            continue;
          }

          if (this.isUnknownColumnError(error)) {
            attempt += 1;
            await this.ensureTableStructure(connection);
            continue;
          }

          if (this.isDataTruncationError(error)) {
            attempt += 1;
            await this.ensureTableStructure(connection);
            continue;
          }

          if (error instanceof AppError) {
            throw error;
          }

          console.error('[SessaoUsuarioRepository] Erro ao criar sessão:', error);
          throw new AppError('Erro interno ao criar sessão do usuário.', 500, false);
        }
      }

      throw new AppError('Erro interno ao criar sessão do usuário.', 500, false);
    } finally {
      connection.release();
    }
  }

  async encontrarSessaoPorId(sessaoId: string): Promise<SessaoUsuario | null> {
    const [rows] = await pool.query<SessaoUsuarioRow[]>(
      'SELECT * FROM SESSOES_USUARIO WHERE sessao_id = ? LIMIT 1',
      [sessaoId],
    );

    return rows.length ? mapRowToEntity(rows[0]) : null;
  }

  async encontrarSessaoAtivaPorPessoa(pessoaId: number): Promise<SessaoUsuario | null> {
    const [rows] = await pool.query<SessaoUsuarioRow[]>(
      'SELECT * FROM SESSOES_USUARIO WHERE PESSOA_pessoa_id = ? AND ativo = 1 LIMIT 1',
      [pessoaId],
    );

    return rows.length ? mapRowToEntity(rows[0]) : null;
  }

  async atualizarUltimaValidacao(sessaoId: string): Promise<void> {
    await pool.query<ResultSetHeader>(
      'UPDATE SESSOES_USUARIO SET ultima_validacao = NOW() WHERE sessao_id = ?',
      [sessaoId],
    );
  }

  async invalidarSessao(sessaoId: string): Promise<void> {
    await pool.query<ResultSetHeader>(
      'UPDATE SESSOES_USUARIO SET ativo = 0 WHERE sessao_id = ?',
      [sessaoId],
    );
  }

  async invalidarSessoesPorPessoa(pessoaId: number): Promise<void> {
    await pool.query<ResultSetHeader>(
      'UPDATE SESSOES_USUARIO SET ativo = 0 WHERE PESSOA_pessoa_id = ?',
      [pessoaId],
    );
  }
}
