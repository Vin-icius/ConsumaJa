// src/infrastructure/repositories/config.mysql.repository.ts
import { pool } from '../database/mysql.connection';
import { AppError } from '../../common/errors/app-error';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export class ConfigMySQLRepository {
    // Notificações
    async findNotificacoesByPessoaId(pessoaId: number): Promise<any> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT notificacao_id as id, PESSOA_pessoa_id as pessoa_id, email_notificacoes, sms_notificacoes, marketing_notificacoes, push_notificacoes FROM NOTIFICACOES_PREFERENCIAS WHERE PESSOA_pessoa_id = ?',
            [pessoaId]
        );
        return rows[0] || null;
    }

    async saveNotificacoes(notificacoes: any): Promise<any> {
        const {
            pessoa_id, email_notificacoes, sms_notificacoes,
            marketing_notificacoes, push_notificacoes
        } = notificacoes;

        if (notificacoes.id) {
            // Update
            await pool.execute(
                `UPDATE NOTIFICACOES_PREFERENCIAS SET
                email_notificacoes = ?, sms_notificacoes = ?,
                marketing_notificacoes = ?, push_notificacoes = ?, data_atualizacao = NOW()
                WHERE notificacao_id = ?`,
                [email_notificacoes, sms_notificacoes, marketing_notificacoes, push_notificacoes, notificacoes.id]
            );
            return notificacoes;
        } else {
            // Insert
            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO NOTIFICACOES_PREFERENCIAS
                (PESSOA_pessoa_id, email_notificacoes, sms_notificacoes,
                 marketing_notificacoes, push_notificacoes, data_criacao, data_atualizacao)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [pessoa_id, email_notificacoes, sms_notificacoes,
                 marketing_notificacoes, push_notificacoes]
            );
            return { ...notificacoes, id: result.insertId };
        }
    }

    // Métodos de Pagamento
    async findMetodosPagamentoByPessoaId(pessoaId: number): Promise<any[]> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT pagamento_id as id, PESSOA_pessoa_id as pessoa_id, tipo_pagamento as tipo, nome_titular as nome_cartao, numero_cartao, data_expiracao as data_validade, cvv, chave_pix, email_paypal, ativo, padrao as principal FROM METODOS_PAGAMENTO WHERE PESSOA_pessoa_id = ? AND ativo = 1 ORDER BY padrao DESC, data_criacao DESC',
            [pessoaId]
        );
        return rows;
    }

    async saveMetodoPagamento(metodo: any): Promise<any> {
        // Mapear campos do objeto para os nomes esperados
        const pessoa_id = metodo.pessoa_id;
        const tipo = metodo.tipo;
        const numero_cartao = metodo.numero_cartao;
        const nome_cartao = metodo.nome_cartao;
        const data_validade = metodo.data_validade;
        const cvv = metodo.cvv;
        const chave_pix = metodo.chave_pix;
        const email_paypal = metodo.email_paypal;
        const principal = metodo.principal;

        // Garantir que campos opcionais sejam null se undefined
        const chavePixValue = chave_pix !== undefined ? chave_pix : null;
        const emailPaypalValue = email_paypal !== undefined ? email_paypal : null;

        if (metodo.id) {
            // Update
            await pool.execute(
                `UPDATE METODOS_PAGAMENTO SET
                tipo_pagamento = ?, nome_titular = ?, numero_cartao = ?,
                data_expiracao = ?, cvv = ?, chave_pix = ?, email_paypal = ?, padrao = ?, data_atualizacao = NOW()
                WHERE pagamento_id = ?`,
                [tipo, nome_cartao, numero_cartao, data_validade,
                 cvv, chavePixValue, emailPaypalValue, principal, metodo.id]
            );
            return metodo;
        } else {
            // Insert
            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO METODOS_PAGAMENTO
                (PESSOA_pessoa_id, tipo_pagamento, nome_titular, numero_cartao,
                 data_expiracao, cvv, chave_pix, email_paypal, padrao, ativo, data_criacao, data_atualizacao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
                [pessoa_id, tipo, nome_cartao, numero_cartao,
                 data_validade, cvv, chavePixValue, emailPaypalValue, principal]
            );
            return { ...metodo, id: result.insertId };
        }
    }

    async findMetodoPagamentoById(id: number, pessoaId: number): Promise<any> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM METODOS_PAGAMENTO WHERE pagamento_id = ? AND PESSOA_pessoa_id = ?',
            [id, pessoaId]
        );
        return rows[0] || null;
    }

    async removeMetodoPagamento(metodo: any): Promise<void> {
        await pool.execute('UPDATE METODOS_PAGAMENTO SET ativo = 0 WHERE pagamento_id = ?', [metodo.id || metodo.pagamento_id]);
    }

    async countMetodosPagamentoByPessoaId(pessoaId: number): Promise<number> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM METODOS_PAGAMENTO WHERE PESSOA_pessoa_id = ? AND ativo = 1',
            [pessoaId]
        );
        return rows[0].count;
    }

    // Configurações de Segurança
    async findConfiguracao2FAByPessoaId(pessoaId: number): Promise<any> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT seguranca_id as id, PESSOA_pessoa_id as pessoa_id, autenticacao_2fa as habilitado, codigo_2fa, tentativas_login, bloqueado_ate FROM CONFIGURACOES_SEGURANCA WHERE PESSOA_pessoa_id = ?',
            [pessoaId]
        );
        return rows[0] || null;
    }

    async saveConfiguracaoSeguranca(config: any): Promise<any> {
        const { pessoa_id, habilitado, codigo_2fa, tentativas_login, bloqueado_ate } = config;

        // Garantir que valores undefined sejam convertidos para null
        const habilitadoValue = habilitado !== undefined ? habilitado : null;
        const codigo2faValue = codigo_2fa !== undefined ? codigo_2fa : null;
        const tentativasValue = tentativas_login !== undefined ? tentativas_login : null;
        const bloqueadoAteValue = bloqueado_ate !== undefined ? bloqueado_ate : null;

        if (config.id) {
            // Update
            await pool.execute(
                `UPDATE CONFIGURACOES_SEGURANCA SET
                autenticacao_2fa = ?, codigo_2fa = ?, tentativas_login = ?,
                bloqueado_ate = ?, data_atualizacao = NOW()
                WHERE seguranca_id = ?`,
                [habilitadoValue, codigo2faValue, tentativasValue, bloqueadoAteValue, config.id]
            );
            return config;
        } else {
            // Insert
            const [result] = await pool.execute<ResultSetHeader>(
                `INSERT INTO CONFIGURACOES_SEGURANCA
                (PESSOA_pessoa_id, autenticacao_2fa, codigo_2fa, tentativas_login,
                 bloqueado_ate, data_criacao, data_atualizacao)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [pessoa_id, habilitadoValue, codigo2faValue, tentativasValue, bloqueadoAteValue]
            );
            return { ...config, id: result.insertId };
        }
    }

    // Histórico de Pagamentos
    async findHistoricoPagamentosByPessoaId(pessoaId: number, page: number = 1, limit: number = 10): Promise<any> {
        const offset = (page - 1) * limit;
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT historico_id as id, PESSOA_pessoa_id as pessoa_id, METODOS_PAGAMENTO_pagamento_id as metodo_pagamento_id, VENDA_venda_id as venda_id, tipo_transacao, valor, moeda, status, gateway_transacao_id, descricao, data_transacao FROM HISTORICO_PAGAMENTOS WHERE PESSOA_pessoa_id = ? ORDER BY data_transacao DESC LIMIT ? OFFSET ?',
            [pessoaId, limit, offset]
        );

        const [countRows] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as total FROM HISTORICO_PAGAMENTOS WHERE PESSOA_pessoa_id = ?',
            [pessoaId]
        );

        return {
            data: rows,
            total: countRows[0].total,
            page,
            limit,
            totalPages: Math.ceil(countRows[0].total / limit)
        };
    }

    // Sessões do Usuário
    async updateSessoesByPessoaId(pessoaId: number, updates: any): Promise<void> {
        const setClause = Object.keys(updates).map(key => `${key === 'ativo' ? 'ativo' : key} = ?`).join(', ');
        const values = Object.values(updates);
        values.push(pessoaId);

        await pool.execute(
            `UPDATE SESSOES_USUARIO SET ${setClause} WHERE PESSOA_pessoa_id = ?`,
            values
        );
    }

    // Logs de Auditoria
    async saveLogAuditoria(log: any): Promise<any> {
        const { pessoa_id, acao, detalhes, ip_address, user_agent } = log;

        // Garantir que valores undefined sejam convertidos para null
        const ipAddressValue = ip_address !== undefined ? ip_address : null;
        const userAgentValue = user_agent !== undefined ? user_agent : null;

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO LOGS_AUDITORIA
            (PESSOA_pessoa_id, acao, dados_novos, ip_address, user_agent, data_acao)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [pessoa_id, acao, detalhes, ipAddressValue, userAgentValue]
        );

        return { ...log, id: result.insertId };
    }

    // Pessoa (para validação)
    async findPessoaById(pessoaId: number): Promise<any> {
        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM pessoa WHERE pessoa_id = ?',
            [pessoaId]
        );
        return rows[0] || null;
    }

    async updatePessoaSenha(pessoaId: number, hashedPassword: string): Promise<void> {
        await pool.execute(
            'UPDATE pessoa SET pessoa_senha = ? WHERE pessoa_id = ?',
            [hashedPassword, pessoaId]
        );
    }
}