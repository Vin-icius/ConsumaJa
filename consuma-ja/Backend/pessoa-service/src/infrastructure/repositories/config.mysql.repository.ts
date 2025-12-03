import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../database/mysql.connection';

interface NotificacoesPreferencias {
  id?: number;
  pessoa_id: number;
  email_notificacoes: boolean;
  sms_notificacoes: boolean;
  marketing_notificacoes: boolean;
  push_notificacoes: boolean;
}

interface MetodoPagamento {
  id?: number;
  pessoa_id: number;
  tipo: string;
  numero_cartao?: string | null;
  nome_cartao?: string | null;
  data_validade?: string | null;
  cvv?: string | null;
  chave_pix?: string | null;
  email_paypal?: string | null;
  principal: boolean;
}

interface ConfiguracaoSeguranca {
  id?: number;
  pessoa_id: number;
  habilitado: boolean;
  codigo_2fa?: string | null;
  tentativas_login?: number | null;
  bloqueado_ate?: Date | null;
  ultima_alteracao_senha?: Date | null;
  senha_temporaria?: number | null;
}

interface HistoricoPagamento {
  id: number;
  pessoa_id: number;
  metodo_pagamento_id: number | null;
  venda_id: number | null;
  tipo_transacao: string;
  valor: number;
  moeda: string;
  status: string;
  gateway_transacao_id: string | null;
  descricao: string | null;
  data_transacao: Date;
}

interface PaginatedHistorico {
  data: HistoricoPagamento[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LogAuditoria {
  id?: number;
  pessoa_id: number;
  acao: string;
  detalhes: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

interface FornecedorPagamentoConfig {
  id?: number;
  fornecedor_pessoa_id: number;
  max_parcelas: number;
  parcelas_sem_juros: number;
  valor_min_parcela: number | null;
  juros_percentual: number | null;
  atualizado_em?: Date;
}

export class ConfigMySQLRepository {
  private tablesEnsured = false;

  private async ensureTables(): Promise<void> {
    if (this.tablesEnsured) {
      return;
    }

    const connection = await pool.getConnection();

    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS NOTIFICACOES_PREFERENCIAS (
          notificacao_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          PESSOA_pessoa_id INT UNSIGNED NOT NULL,
          email_notificacoes TINYINT(1) NOT NULL DEFAULT 1,
          sms_notificacoes TINYINT(1) NOT NULL DEFAULT 0,
          marketing_notificacoes TINYINT(1) NOT NULL DEFAULT 1,
          push_notificacoes TINYINT(1) NOT NULL DEFAULT 1,
          data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (notificacao_id),
          UNIQUE INDEX uk_notificacoes_pessoa (PESSOA_pessoa_id),
          CONSTRAINT fk_notificacoes_pessoa FOREIGN KEY (PESSOA_pessoa_id)
            REFERENCES PESSOA (pessoa_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS METODOS_PAGAMENTO (
          pagamento_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          PESSOA_pessoa_id INT UNSIGNED NOT NULL,
          tipo_pagamento VARCHAR(32) NOT NULL,
          nome_titular VARCHAR(128) NULL,
          numero_cartao LONGTEXT NULL,
          data_expiracao VARCHAR(10) NULL,
          cvv LONGTEXT NULL,
          chave_pix VARCHAR(255) NULL,
          email_paypal VARCHAR(255) NULL,
          padrao TINYINT(1) NOT NULL DEFAULT 0,
          ativo TINYINT(1) NOT NULL DEFAULT 1,
          data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (pagamento_id),
          INDEX idx_pagamento_pessoa (PESSOA_pessoa_id),
          CONSTRAINT fk_pagamento_pessoa FOREIGN KEY (PESSOA_pessoa_id)
            REFERENCES PESSOA (pessoa_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS CONFIGURACOES_SEGURANCA (
          seguranca_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          PESSOA_pessoa_id INT UNSIGNED NOT NULL,
          autenticacao_2fa TINYINT(1) NOT NULL DEFAULT 0,
          codigo_2fa VARCHAR(64) NULL,
          tentativas_login INT NULL DEFAULT 0,
          bloqueado_ate DATETIME NULL,
          ultima_alteracao_senha DATETIME NULL,
          senha_temporaria TINYINT(1) NOT NULL DEFAULT 0,
          data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (seguranca_id),
          UNIQUE INDEX uk_seg_pessoa (PESSOA_pessoa_id),
          CONSTRAINT fk_seg_pessoa FOREIGN KEY (PESSOA_pessoa_id)
            REFERENCES PESSOA (pessoa_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS HISTORICO_PAGAMENTOS (
          historico_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          PESSOA_pessoa_id INT UNSIGNED NOT NULL,
          METODOS_PAGAMENTO_pagamento_id INT UNSIGNED NULL,
          VENDA_venda_id INT UNSIGNED NULL,
          tipo_transacao VARCHAR(64) NOT NULL,
          valor DECIMAL(10,2) NOT NULL DEFAULT 0,
          moeda VARCHAR(8) NOT NULL DEFAULT 'BRL',
          status VARCHAR(32) NOT NULL DEFAULT 'PENDENTE',
          gateway_transacao_id VARCHAR(128) NULL,
          descricao VARCHAR(255) NULL,
          data_transacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (historico_id),
          INDEX idx_hist_pessoa (PESSOA_pessoa_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS LOGS_AUDITORIA (
          log_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          PESSOA_pessoa_id INT UNSIGNED NOT NULL,
          acao VARCHAR(64) NOT NULL,
          dados_novos LONGTEXT NULL,
          ip_address VARCHAR(64) NULL,
          user_agent VARCHAR(255) NULL,
          data_acao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (log_id),
          INDEX idx_logs_pessoa (PESSOA_pessoa_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS FORNECEDOR_PAGAMENTO_CONFIG (
          config_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
          FORNECEDOR_pessoa_id INT UNSIGNED NOT NULL,
          max_parcelas INT UNSIGNED NOT NULL DEFAULT 3,
          parcelas_sem_juros INT UNSIGNED NOT NULL DEFAULT 1,
          valor_min_parcela DECIMAL(10,2) NULL,
          juros_percentual DECIMAL(5,2) NULL,
          atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (config_id),
          UNIQUE INDEX uk_config_fornecedor (FORNECEDOR_pessoa_id),
          CONSTRAINT fk_config_fornecedor_pessoa FOREIGN KEY (FORNECEDOR_pessoa_id)
            REFERENCES PESSOA (pessoa_id)
            ON DELETE CASCADE
            ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
      `);

      this.tablesEnsured = true;
    } finally {
      connection.release();
    }
  }

  private toBoolean(value: any): boolean {
    return Boolean(value);
  }

  async findNotificacoesByPessoaId(pessoaId: number): Promise<NotificacoesPreferencias | null> {
    await this.ensureTables();
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT notificacao_id AS id,
              PESSOA_pessoa_id AS pessoa_id,
              email_notificacoes,
              sms_notificacoes,
              marketing_notificacoes,
              push_notificacoes
         FROM NOTIFICACOES_PREFERENCIAS
        WHERE PESSOA_pessoa_id = ?
        LIMIT 1`,
      [pessoaId],
    );

    if (!rows.length) {
      return null;
    }

    const row = rows[0];

    return {
      id: row.id as number,
      pessoa_id: row.pessoa_id as number,
      email_notificacoes: this.toBoolean(row.email_notificacoes),
      sms_notificacoes: this.toBoolean(row.sms_notificacoes),
      marketing_notificacoes: this.toBoolean(row.marketing_notificacoes),
      push_notificacoes: this.toBoolean(row.push_notificacoes),
    };
  }

  async saveNotificacoes(notificacoes: NotificacoesPreferencias): Promise<NotificacoesPreferencias> {
    await this.ensureTables();

    if (notificacoes.id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE NOTIFICACOES_PREFERENCIAS
            SET email_notificacoes = ?,
                sms_notificacoes = ?,
                marketing_notificacoes = ?,
                push_notificacoes = ?,
                data_atualizacao = NOW()
          WHERE notificacao_id = ?`,
        [
          notificacoes.email_notificacoes,
          notificacoes.sms_notificacoes,
          notificacoes.marketing_notificacoes,
          notificacoes.push_notificacoes,
          notificacoes.id,
        ],
      );
      return notificacoes;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO NOTIFICACOES_PREFERENCIAS (
          PESSOA_pessoa_id,
          email_notificacoes,
          sms_notificacoes,
          marketing_notificacoes,
          push_notificacoes,
          data_criacao,
          data_atualizacao)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        notificacoes.pessoa_id,
        notificacoes.email_notificacoes,
        notificacoes.sms_notificacoes,
        notificacoes.marketing_notificacoes,
        notificacoes.push_notificacoes,
      ],
    );

    return { ...notificacoes, id: result.insertId };
  }

  async findMetodosPagamentoByPessoaId(pessoaId: number): Promise<MetodoPagamento[]> {
    await this.ensureTables();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT pagamento_id AS id,
              PESSOA_pessoa_id AS pessoa_id,
              tipo_pagamento AS tipo,
              nome_titular AS nome_cartao,
              numero_cartao,
              data_expiracao AS data_validade,
              cvv,
              chave_pix,
              email_paypal,
              padrao AS principal
         FROM METODOS_PAGAMENTO
        WHERE PESSOA_pessoa_id = ?
          AND ativo = 1
        ORDER BY padrao DESC, data_criacao DESC`,
      [pessoaId],
    );

    return rows.map((row) => ({
      id: row.id as number,
      pessoa_id: row.pessoa_id as number,
      tipo: row.tipo as string,
      nome_cartao: row.nome_cartao ?? null,
      numero_cartao: row.numero_cartao ?? null,
      data_validade: row.data_validade ?? null,
      cvv: row.cvv ?? null,
      chave_pix: row.chave_pix ?? null,
      email_paypal: row.email_paypal ?? null,
      principal: this.toBoolean(row.principal),
    }));
  }

  async saveMetodoPagamento(metodo: MetodoPagamento): Promise<MetodoPagamento> {
    await this.ensureTables();

    const payload = {
      pessoa_id: metodo.pessoa_id,
      tipo: metodo.tipo,
      nome_cartao: metodo.nome_cartao ?? null,
      numero_cartao: metodo.numero_cartao ?? null,
      data_validade: metodo.data_validade ?? null,
      cvv: metodo.cvv ?? null,
      chave_pix: metodo.chave_pix ?? null,
      email_paypal: metodo.email_paypal ?? null,
      principal: metodo.principal ? 1 : 0,
    };

    if (metodo.id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE METODOS_PAGAMENTO
            SET tipo_pagamento = ?,
                nome_titular = ?,
                numero_cartao = ?,
                data_expiracao = ?,
                cvv = ?,
                chave_pix = ?,
                email_paypal = ?,
                padrao = ?,
                data_atualizacao = NOW()
          WHERE pagamento_id = ?`,
        [
          payload.tipo,
          payload.nome_cartao,
          payload.numero_cartao,
          payload.data_validade,
          payload.cvv,
          payload.chave_pix,
          payload.email_paypal,
          payload.principal,
          metodo.id,
        ],
      );
      return metodo;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO METODOS_PAGAMENTO (
          PESSOA_pessoa_id,
          tipo_pagamento,
          nome_titular,
          numero_cartao,
          data_expiracao,
          cvv,
          chave_pix,
          email_paypal,
          padrao,
          ativo,
          data_criacao,
          data_atualizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [
        payload.pessoa_id,
        payload.tipo,
        payload.nome_cartao,
        payload.numero_cartao,
        payload.data_validade,
        payload.cvv,
        payload.chave_pix,
        payload.email_paypal,
        payload.principal,
      ],
    );

    return { ...metodo, id: result.insertId };
  }

  async findMetodoPagamentoById(id: number, pessoaId: number): Promise<MetodoPagamento | null> {
    await this.ensureTables();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT pagamento_id AS id,
              PESSOA_pessoa_id AS pessoa_id,
              tipo_pagamento AS tipo,
              nome_titular AS nome_cartao,
              numero_cartao,
              data_expiracao AS data_validade,
              cvv,
              chave_pix,
              email_paypal,
              padrao AS principal,
              ativo
         FROM METODOS_PAGAMENTO
        WHERE pagamento_id = ?
          AND PESSOA_pessoa_id = ?
        LIMIT 1`,
      [id, pessoaId],
    );

    if (!rows.length) {
      return null;
    }

    const row = rows[0];

    return {
      id: row.id as number,
      pessoa_id: row.pessoa_id as number,
      tipo: row.tipo as string,
      nome_cartao: row.nome_cartao ?? null,
      numero_cartao: row.numero_cartao ?? null,
      data_validade: row.data_validade ?? null,
      cvv: row.cvv ?? null,
      chave_pix: row.chave_pix ?? null,
      email_paypal: row.email_paypal ?? null,
      principal: this.toBoolean(row.principal),
    };
  }

  async removeMetodoPagamento(metodo: MetodoPagamento): Promise<void> {
    await this.ensureTables();

    await pool.execute<ResultSetHeader>(
      `UPDATE METODOS_PAGAMENTO
          SET ativo = 0,
              data_atualizacao = NOW()
        WHERE pagamento_id = ?`,
      [metodo.id],
    );
  }

  async setMetodoPagamentoPrincipal(pessoaId: number, pagamentoId: number): Promise<boolean> {
    await this.ensureTables();

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.query<ResultSetHeader>(
        `UPDATE METODOS_PAGAMENTO
            SET padrao = 0,
                data_atualizacao = NOW()
          WHERE PESSOA_pessoa_id = ?
            AND ativo = 1`,
        [pessoaId],
      );

      const [result] = await connection.query<ResultSetHeader>(
        `UPDATE METODOS_PAGAMENTO
            SET padrao = 1,
                data_atualizacao = NOW()
          WHERE pagamento_id = ?
            AND PESSOA_pessoa_id = ?
            AND ativo = 1`,
        [pagamentoId, pessoaId],
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error('[ConfigRepository] Erro ao definir método principal:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async countMetodosPagamentoByPessoaId(pessoaId: number): Promise<number> {
    await this.ensureTables();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
         FROM METODOS_PAGAMENTO
        WHERE PESSOA_pessoa_id = ?
          AND ativo = 1`,
      [pessoaId],
    );

    return Number(rows[0]?.total ?? 0);
  }

  async findConfiguracao2FAByPessoaId(pessoaId: number): Promise<ConfiguracaoSeguranca | null> {
    await this.ensureTables();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT seguranca_id AS id,
              PESSOA_pessoa_id AS pessoa_id,
              autenticacao_2fa AS habilitado,
              codigo_2fa,
              tentativas_login,
              bloqueado_ate,
              ultima_alteracao_senha,
              senha_temporaria
         FROM CONFIGURACOES_SEGURANCA
        WHERE PESSOA_pessoa_id = ?
        LIMIT 1`,
      [pessoaId],
    );

    if (!rows.length) {
      return null;
    }

    const row = rows[0];

    return {
      id: row.id as number,
      pessoa_id: row.pessoa_id as number,
      habilitado: this.toBoolean(row.habilitado),
      codigo_2fa: row.codigo_2fa ?? null,
      tentativas_login: row.tentativas_login ?? null,
      bloqueado_ate: row.bloqueado_ate ? new Date(row.bloqueado_ate) : null,
      ultima_alteracao_senha: row.ultima_alteracao_senha ? new Date(row.ultima_alteracao_senha) : null,
      senha_temporaria: row.senha_temporaria ?? null,
    };
  }

  async saveConfiguracaoSeguranca(config: ConfiguracaoSeguranca): Promise<ConfiguracaoSeguranca> {
    await this.ensureTables();

    const payload = {
      pessoa_id: config.pessoa_id,
      habilitado: config.habilitado ? 1 : 0,
      codigo_2fa: config.codigo_2fa ?? null,
      tentativas: config.tentativas_login ?? 0,
      bloqueado: config.bloqueado_ate ?? null,
      ultimaAlteracao: config.ultima_alteracao_senha ?? null,
      senhaTemporaria: config.senha_temporaria ?? 0,
    };

    if (config.id) {
      await pool.execute<ResultSetHeader>(
        `UPDATE CONFIGURACOES_SEGURANCA
            SET autenticacao_2fa = ?,
                codigo_2fa = ?,
                tentativas_login = ?,
                bloqueado_ate = ?,
                ultima_alteracao_senha = ?,
                senha_temporaria = ?,
                data_atualizacao = NOW()
          WHERE seguranca_id = ?`,
  [payload.habilitado, payload.codigo_2fa, payload.tentativas, payload.bloqueado, payload.ultimaAlteracao, payload.senhaTemporaria, config.id],
      );
      return config;
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO CONFIGURACOES_SEGURANCA (
          PESSOA_pessoa_id,
          autenticacao_2fa,
          codigo_2fa,
          tentativas_login,
          bloqueado_ate,
          ultima_alteracao_senha,
          senha_temporaria,
          data_criacao,
          data_atualizacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
  [payload.pessoa_id, payload.habilitado, payload.codigo_2fa, payload.tentativas, payload.bloqueado, payload.ultimaAlteracao, payload.senhaTemporaria],
    );

    return { ...config, id: result.insertId };
  }

  async deleteConfiguracaoSeguranca(pessoaId: number): Promise<void> {
    await this.ensureTables();
    await pool.execute<ResultSetHeader>(
      `DELETE FROM CONFIGURACOES_SEGURANCA WHERE PESSOA_pessoa_id = ?`,
      [pessoaId],
    );
  }

  async findHistoricoPagamentosByPessoaId(
    pessoaId: number,
    page = 1,
    limit = 10,
  ): Promise<PaginatedHistorico> {
    await this.ensureTables();

    const offset = (page - 1) * limit;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT historico_id AS id,
              PESSOA_pessoa_id AS pessoa_id,
              METODOS_PAGAMENTO_pagamento_id AS metodo_pagamento_id,
              VENDA_venda_id AS venda_id,
              tipo_transacao,
              valor,
              moeda,
              status,
              gateway_transacao_id,
              descricao,
              data_transacao
         FROM HISTORICO_PAGAMENTOS
        WHERE PESSOA_pessoa_id = ?
        ORDER BY data_transacao DESC
        LIMIT ? OFFSET ?`,
      [pessoaId, limit, offset],
    );

    const [countRows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
         FROM HISTORICO_PAGAMENTOS
        WHERE PESSOA_pessoa_id = ?`,
      [pessoaId],
    );

    const total = Number(countRows[0]?.total ?? 0);

    const data: HistoricoPagamento[] = rows.map((row) => ({
      id: row.id as number,
      pessoa_id: row.pessoa_id as number,
      metodo_pagamento_id: row.metodo_pagamento_id ?? null,
      venda_id: row.venda_id ?? null,
      tipo_transacao: row.tipo_transacao as string,
      valor: Number(row.valor ?? 0),
      moeda: row.moeda as string,
      status: row.status as string,
      gateway_transacao_id: row.gateway_transacao_id ?? null,
      descricao: row.descricao ?? null,
      data_transacao: new Date(row.data_transacao),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async updateSessoesByPessoaId(pessoaId: number, updates: Record<string, any>): Promise<void> {
    if (!updates || Object.keys(updates).length === 0) {
      return;
    }

    const setClause = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');

    const values = Object.values(updates);
    values.push(pessoaId);

    await pool.execute<ResultSetHeader>(
      `UPDATE SESSOES_USUARIO
          SET ${setClause}
        WHERE PESSOA_pessoa_id = ?`,
      values,
    );
  }

  async saveLogAuditoria(log: LogAuditoria): Promise<LogAuditoria> {
    await this.ensureTables();

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO LOGS_AUDITORIA (
          PESSOA_pessoa_id,
          acao,
          dados_novos,
          ip_address,
          user_agent,
          data_acao)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [log.pessoa_id, log.acao, log.detalhes ?? null, log.ip_address ?? null, log.user_agent ?? null],
    );

    return { ...log, id: result.insertId };
  }

  async findFornecedorPagamentoConfig(fornecedorId: number): Promise<FornecedorPagamentoConfig | null> {
    await this.ensureTables();

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT config_id AS id,
              FORNECEDOR_pessoa_id AS fornecedor_pessoa_id,
              max_parcelas,
              parcelas_sem_juros,
              valor_min_parcela,
              juros_percentual,
              atualizado_em
         FROM FORNECEDOR_PAGAMENTO_CONFIG
        WHERE FORNECEDOR_pessoa_id = ?
        LIMIT 1`,
      [fornecedorId],
    );

    if (!rows.length) {
      return null;
    }

    const row = rows[0];

    return {
      id: Number(row.id),
      fornecedor_pessoa_id: Number(row.fornecedor_pessoa_id),
      max_parcelas: Number(row.max_parcelas ?? 3),
      parcelas_sem_juros: Number(row.parcelas_sem_juros ?? 1),
      valor_min_parcela: row.valor_min_parcela !== null ? Number(row.valor_min_parcela) : null,
      juros_percentual: row.juros_percentual !== null ? Number(row.juros_percentual) : null,
      atualizado_em: row.atualizado_em ? new Date(row.atualizado_em) : undefined,
    };
  }

  async saveFornecedorPagamentoConfig(config: FornecedorPagamentoConfig): Promise<FornecedorPagamentoConfig> {
    await this.ensureTables();

    const payload = {
      fornecedor_pessoa_id: config.fornecedor_pessoa_id,
      max_parcelas: config.max_parcelas,
      parcelas_sem_juros: config.parcelas_sem_juros,
      valor_min_parcela: config.valor_min_parcela,
      juros_percentual: config.juros_percentual,
    };

    await pool.execute<ResultSetHeader>(
      `INSERT INTO FORNECEDOR_PAGAMENTO_CONFIG (
          FORNECEDOR_pessoa_id,
          max_parcelas,
          parcelas_sem_juros,
          valor_min_parcela,
          juros_percentual)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
          max_parcelas = VALUES(max_parcelas),
          parcelas_sem_juros = VALUES(parcelas_sem_juros),
          valor_min_parcela = VALUES(valor_min_parcela),
          juros_percentual = VALUES(juros_percentual),
          atualizado_em = CURRENT_TIMESTAMP`,
      [
        payload.fornecedor_pessoa_id,
        payload.max_parcelas,
        payload.parcelas_sem_juros,
        payload.valor_min_parcela,
        payload.juros_percentual,
      ],
    );

    const saved = await this.findFornecedorPagamentoConfig(payload.fornecedor_pessoa_id);
    return saved ?? {
      ...payload,
    };
  }

  async findPessoaById(pessoaId: number): Promise<any | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT *
         FROM PESSOA
        WHERE pessoa_id = ?
        LIMIT 1`,
      [pessoaId],
    );

    return rows.length ? rows[0] : null;
  }

  async updatePessoaSenha(pessoaId: number, hashedPassword: string): Promise<void> {
    await pool.execute<ResultSetHeader>(
      `UPDATE PESSOA
          SET pessoa_senha = ?
        WHERE pessoa_id = ?`,
      [hashedPassword, pessoaId],
    );
  }
}
