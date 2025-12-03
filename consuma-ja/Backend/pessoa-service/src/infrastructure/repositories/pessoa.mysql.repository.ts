import { Pessoa, PessoaStatus, PessoaTipo } from "../../domain/entities/pessoa.entity";
import { PessoaRepository, CreatePessoaData, UpdatePessoaData, PaginatedRepositoryResponse, UpdateEnderecoData } from "../../domain/repositories/pessoa.repository";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ListarPessoasQueryDto } from "../../interfaces/dtos/listar-pessoas-query.dto"
// Interface para a linha retornada do DB com JOINs opcionais
interface PessoaRow extends RowDataPacket {
    pessoa_id: number;
    pessoa_nome: string;
    pessoa_email: string;
    pessoa_telefone: string | null;
    pessoa_tipo: PessoaTipo;
    pessoa_login: string;
    pessoa_senha?: string;
    pessoa_status: PessoaStatus;
    data_criacao: Date | null;
    pessoa_cpf?: string | null;
    pessoa_documentoValidado?: number | null;
    pessoa_fotoValidada?: number | null;
    cnpj?: string | null;
    fornecedor_num?: number | null;
    endereco_id?: number | null;
    endereco_rua?: string | null;
    endereco_numero?: string | null;
    endereco_bairro?: string | null;
    endereco_cep?: string | null;
    endereco_complemento?: string | null;
    endereco_cidade_id?: number | null;
    cidade_nome?: string | null;
    estado_id?: number | null;
    estado_nome?: string | null;
    estado_sigla?: string | null;
}


export class PessoaMySQLRepository implements PessoaRepository {

    // Helper para mapear a linha completa para a entidade Pessoa
    private mapRowToPessoa(row: PessoaRow): Pessoa {
        const pessoa: Pessoa = {
            pessoa_id: row.pessoa_id,
            pessoa_nome: row.pessoa_nome,
            pessoa_email: row.pessoa_email,
            pessoa_telefone: row.pessoa_telefone,
            pessoa_tipo: row.pessoa_tipo,
            pessoa_login: row.pessoa_login,
            pessoa_senha: row.pessoa_senha, // Pode ser undefined se não selecionado
            pessoa_status: row.pessoa_status,
            data_criacao: row.data_criacao ? new Date(row.data_criacao) : null,
            ativo: Boolean(row.pessoa_status), // Mapeia 0/1 para false/true
        };

        if (row.pessoa_tipo === 'Fisica' && row.pessoa_cpf) {
            pessoa.pessoa_cpf = row.pessoa_cpf;
            pessoa.documento = row.pessoa_cpf;
            pessoa.fisica = {
                PESSOA_pessoa_id: row.pessoa_id,
                pessoa_cpf: row.pessoa_cpf,
                pessoa_documentoValidado: Boolean(row.pessoa_documentoValidado ?? 0),
                pessoa_fotoValidada: Boolean(row.pessoa_fotoValidada ?? 0),
            };
        } else if (row.pessoa_tipo === 'Juridica' && row.cnpj) {
            pessoa.pessoa_cnpj = row.cnpj;
            pessoa.documento = row.cnpj;
            pessoa.pessoa_num_fornecedor = row.fornecedor_num ?? null;
            pessoa.juridica = {
                PESSOA_pessoa_id: row.pessoa_id,
                cnpj: row.cnpj,
                fornecedor_num: row.fornecedor_num ?? null, // Usa ?? null
             };
        }

        if (!pessoa.documento && row.pessoa_cpf) {
            pessoa.documento = row.pessoa_cpf;
        } else if (!pessoa.documento && row.cnpj) {
            pessoa.documento = row.cnpj;
        }

        if (row.endereco_id) {
            pessoa.endereco = {
                endereco_id: row.endereco_id,
                endereco_rua: row.endereco_rua ?? '',
                endereco_numero: row.endereco_numero ?? '',
                endereco_bairro: row.endereco_bairro ?? '',
                endereco_cep: row.endereco_cep ?? '',
                endereco_complemento: row.endereco_complemento ?? null,
                cidade_id: row.endereco_cidade_id ?? null,
                cidade_nome: row.cidade_nome ?? null,
                estado_id: row.estado_id ?? null,
                estado_nome: row.estado_nome ?? null,
                estado_sigla: row.estado_sigla ?? null,
            };
        } else {
            pessoa.endereco = null;
        }

        return pessoa;
    }

    async listar(filtros: ListarPessoasQueryDto): Promise<PaginatedRepositoryResponse<Pessoa>> {
        console.log("[Repo Pessoa] Listando pessoas com filtros:", filtros);

        let baseFromClause = `
            FROM PESSOA p
            LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
            LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
            LEFT JOIN ENDERECO e ON e.PESSOA_pessoa_id = p.pessoa_id AND e.ativo = 1
            LEFT JOIN CIDADE c ON c.cidade_id = e.CIDADE_cidade_id
            LEFT JOIN ESTADO est ON est.estado_id = c.ESTADO_estado_id
        `;
        let countSelectQuery = `SELECT COUNT(DISTINCT p.pessoa_id) as total ${baseFromClause}`;
        let dataSelectQuery = `SELECT p.*, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, f.foto_selfie_path, f.foto_documento_path, j.cnpj, j.fornecedor_num,
            e.endereco_id, e.rua AS endereco_rua, e.numero AS endereco_numero, e.bairro AS endereco_bairro, e.cep AS endereco_cep, e.complemento AS endereco_complemento,
            e.CIDADE_cidade_id AS endereco_cidade_id, c.cidade_nome, est.estado_id, est.estado_nome, est.estado_sigla ${baseFromClause}`;

        const conditions: string[] = [];
        const params: any[] = [];

        if (filtros.nomeQuery && filtros.nomeQuery.trim() !== "") {
            conditions.push("p.pessoa_nome LIKE ?");
            params.push(`%${filtros.nomeQuery.trim()}%`);
        }
        if (filtros.pessoa_tipo) {
            conditions.push("p.pessoa_tipo = ?");
            params.push(filtros.pessoa_tipo);
        }
        if (filtros.pessoa_status !== undefined) {
            conditions.push("p.pessoa_status = ?");
            params.push(filtros.pessoa_status);
        }

        const whereClause = conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : "";
        countSelectQuery += whereClause;
        dataSelectQuery += whereClause;

        dataSelectQuery += " ORDER BY p.pessoa_nome ASC";

        const page = filtros.page || 1;
        const limit = filtros.limit || 10;
        const offset = (page - 1) * limit;

        dataSelectQuery += " LIMIT ? OFFSET ?";
        const dataParams = [...params, limit, offset];

        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);

            console.log("[Repo Pessoa] Count Query:", countSelectQuery.replace(/\s+/g, ' ').trim(), params);
            const [countRows] = await pool.query<RowDataPacket[]>(countSelectQuery, params);
            const total = countRows[0]?.total || 0;

            console.log("[Repo Pessoa] Data Query:", dataSelectQuery.replace(/\s+/g, ' ').trim(), dataParams);
            const [dataRows] = await pool.query<PessoaRow[]>(dataSelectQuery, dataParams);

            const data = dataRows.map(row => {
                const pessoa = this.mapRowToPessoa(row);
                delete pessoa.pessoa_senha; // Nunca retornar senha em listagens
                return pessoa;
            });

            return { data, total };

        } catch (error: any) {
            console.error("[Repo Pessoa] Erro ao listar pessoas:", error);
            throw new AppError("Erro no banco de dados ao listar pessoas.", 500, false);
        }
    }

    // --- Métodos de Busca ---
    async findByLoginOrEmailOrDoc(identifier: string): Promise<Pessoa | null> {
        // <<< Incluir p.pessoa_senha na query de login >>>
        const query = `
            SELECT p.*, p.pessoa_senha, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num,
                   e.endereco_id, e.rua AS endereco_rua, e.numero AS endereco_numero, e.bairro AS endereco_bairro, e.cep AS endereco_cep,
                   e.complemento AS endereco_complemento, e.CIDADE_cidade_id AS endereco_cidade_id,
                   c.cidade_nome, est.estado_id, est.estado_nome, est.estado_sigla
            FROM PESSOA p
            LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
            LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
            LEFT JOIN ENDERECO e ON e.PESSOA_pessoa_id = p.pessoa_id AND e.ativo = 1
            LEFT JOIN CIDADE c ON c.cidade_id = e.CIDADE_cidade_id
            LEFT JOIN ESTADO est ON est.estado_id = c.ESTADO_estado_id
            WHERE p.pessoa_login = ? OR p.pessoa_email = ? OR f.pessoa_cpf = ? OR j.cnpj = ?
            LIMIT 1
        `;
        const cleanedIdentifier = identifier.replace(/[.\-\/]/g, '');
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<PessoaRow[]>(query, [identifier, identifier, cleanedIdentifier, cleanedIdentifier]);
            return rows.length > 0 ? this.mapRowToPessoa(rows[0]) : null;
        } catch (error: any) { /* ... tratamento mantido ... */ throw new AppError("Erro DB...", 500, false); }
    }

    async findById(id: number): Promise<Pessoa | null> {
         // Não seleciona a senha por padrão em findById
         const query = `
            SELECT p.*, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num,
                   e.endereco_id, e.rua AS endereco_rua, e.numero AS endereco_numero, e.bairro AS endereco_bairro,
                   e.cep AS endereco_cep, e.complemento AS endereco_complemento, e.CIDADE_cidade_id AS endereco_cidade_id,
                   c.cidade_nome, est.estado_id, est.estado_nome, est.estado_sigla
            FROM PESSOA p
            LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
            LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
            LEFT JOIN ENDERECO e ON e.PESSOA_pessoa_id = p.pessoa_id AND e.ativo = 1
            LEFT JOIN CIDADE c ON c.cidade_id = e.CIDADE_cidade_id
            LEFT JOIN ESTADO est ON est.estado_id = c.ESTADO_estado_id
            WHERE p.pessoa_id = ?
            LIMIT 1
        `;
         try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<PessoaRow[]>(query, [id]);
            return rows.length > 0 ? this.mapRowToPessoa(rows[0]) : null;
        } catch (error: any) { /* ... tratamento mantido ... */ throw new AppError(`Erro DB ao buscar usuário ${id}.`, 500, false); }
    }

    async findByEmail(email: string): Promise<Pick<Pessoa, 'pessoa_id'> | null> {
      const query = "SELECT pessoa_id FROM PESSOA WHERE pessoa_email = ? LIMIT 1";
      try {
           if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
           const [rows] = await pool.query<RowDataPacket[]>(query, [email]);
           return rows.length > 0 ? { pessoa_id: rows[0].pessoa_id } : null;
      } catch (error) {
           console.error("[Repo] Erro ao buscar pessoa por email:", error);
           throw new AppError("Erro DB ao buscar por email.", 500, false);
      }
  }

    async findByLogin(login: string): Promise<Pick<Pessoa, 'pessoa_id'> | null> {
      const query = "SELECT pessoa_id FROM PESSOA WHERE pessoa_login = ? LIMIT 1";
       try {
           if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
           const [rows] = await pool.query<RowDataPacket[]>(query, [login]);
           return rows.length > 0 ? { pessoa_id: rows[0].pessoa_id } : null;
       } catch (error) {
           console.error("[Repo] Erro ao buscar pessoa por login:", error);
           throw new AppError("Erro DB ao buscar por login.", 500, false);
       }
  }

    // --- Métodos de Modificação ---

    // Criar Pessoa (usando Transaction)
    async criar(data: CreatePessoaData): Promise<Pessoa> {
        const {
            pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo,
            pessoa_login, pessoa_senha, // Senha JÁ VEM HASHADA do Service
            fisicaData, juridicaData,
            cep, rua, bairro, numero, complemento, CIDADE_cidade_id
        } = data;

        let connection;
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Inserir PESSOA
            const pessoaQuery = `INSERT INTO PESSOA (pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo, pessoa_login, pessoa_senha, pessoa_status, data_criacao) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`;
            const pessoaStatus = 1; // Ativo
            const [resultPessoa] = await connection.query<ResultSetHeader>(pessoaQuery, [
                pessoa_nome, pessoa_email, pessoa_telefone, pessoa_tipo,
                pessoa_login, pessoa_senha, pessoaStatus
            ]);
            const insertedId = resultPessoa.insertId;

            // Inserir FISICA ou JURIDICA
            if (pessoa_tipo === 'Fisica' && fisicaData) {
                const fisicaQuery = `INSERT INTO FISICA (PESSOA_pessoa_id, pessoa_cpf, pessoa_documentoValidado, pessoa_fotoValidada) VALUES (?, ?, ?, ?)`;
                await connection.query(fisicaQuery, [insertedId, fisicaData.pessoa_cpf, 0, 0]); // Assume validação = false
            } else if (pessoa_tipo === 'Juridica' && juridicaData) {
                const juridicaQuery = `INSERT INTO JURIDICA (PESSOA_pessoa_id, cnpj, fornecedor_num) VALUES (?, ?, ?)`;
                await connection.query(juridicaQuery, [insertedId, juridicaData.cnpj, juridicaData.fornecedor_num]);
            } else if (pessoa_tipo !== 'Admin') {
                 throw new AppError(`Dados incompletos para tipo de pessoa '${pessoa_tipo}'`, 400); // Erro se não for Admin e faltar dados
            }

            // <<< 3. INSERIR NA TABELA ENDERECO >>>
            const enderecoQuery = `
                INSERT INTO ENDERECO (PESSOA_pessoa_id, CIDADE_cidade_id, rua, numero, bairro, cep, complemento, ativo)
                VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
            `;
            // O frontend já deve ter validado e obtido CIDADE_cidade_id
            await connection.query<ResultSetHeader>(enderecoQuery, [
                insertedId, CIDADE_cidade_id, rua, numero, bairro, cep, complemento
            ]);
            console.log(`[Repo Pessoa] Endereço inserido para Pessoa ID: ${insertedId}`);
            // ------------------------------------

            await connection.commit();

            // Busca a pessoa recém-criada completa
            const novaPessoa = await this.findById(insertedId); // findById agora usa a pool padrão, não a connection
            if (!novaPessoa) throw new AppError("Falha ao buscar pessoa após criação.", 500, false);
            return novaPessoa;

        } catch (error: any) {
            if (connection) await connection.rollback(); // Rollback em caso de erro
            // Tratar erros de duplicação (ER_DUP_ENTRY) ou FK (ER_NO_REFERENCED_ROW_2)
            if (error.code === 'ER_DUP_ENTRY') {
                 // Identificar qual campo causou a duplicação
                 if (error.message.includes('pessoa_email_UNIQUE')) throw new AppError(`O email "${pessoa_email}" já está em uso.`, 409);
                 if (error.message.includes('pessoa_login_UNIQUE')) throw new AppError(`O login/documento "${pessoa_login}" já está em uso.`, 409);
                 // Adicionar checagens para CPF/CNPJ se eles têm constraints UNIQUE separadas
                 if (fisicaData && error.message.includes(fisicaData.pessoa_cpf)) throw new AppError(`O CPF "${fisicaData.pessoa_cpf}" já está em uso.`, 409);
                 if (juridicaData && error.message.includes(juridicaData.cnpj)) throw new AppError(`O CNPJ "${juridicaData.cnpj}" já está em uso.`, 409);
                 throw new AppError("Erro de duplicação ao criar pessoa.", 409);
             } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                 // Verificar qual FK falhou (ex: CIDADE_cidade_id)
                 if (error.message.includes('fk_ENDERECO_CIDADE1')) throw new AppError(`Cidade com ID ${CIDADE_cidade_id} não encontrada. Verifique os dados de endereço.`, 400);
                 throw new AppError("Erro de referência: Cidade ou outro dado relacionado inválido.", 400);
             }
             console.error("[Repo Pessoa] Erro ao criar pessoa e endereço:", error);
             throw new AppError("Erro no banco de dados ao criar pessoa e endereço.", 500, false);
        } finally {
            if (connection) connection.release();
        }
    }

    // Atualizar Pessoa (apenas tabela PESSOA)
    async atualizar(id: number, data: UpdatePessoaData): Promise<Pessoa | null> {
        const fields = Object.keys(data).filter(key => data[key as keyof UpdatePessoaData] !== undefined);
        const setParts: string[] = [];
        const values: any[] = [];

        // Senha deve vir HASHADA do serviço se for atualizada
        fields.forEach(key => {
            // Valida se a chave é permitida para update (baseado em UpdatePessoaData)
            if (['pessoa_nome', 'pessoa_email', 'pessoa_telefone', 'pessoa_senha', 'pessoa_status'].includes(key)) {
                 setParts.push(`${key} = ?`);
                 values.push(data[key as keyof UpdatePessoaData]);
            }
        });

        if (setParts.length === 0) {
             console.warn(`[Repo] Tentativa de atualizar pessoa ${id} sem dados válidos.`);
             return this.findById(id); // Retorna o usuário atual sem fazer update
        }

        const query = `UPDATE PESSOA SET ${setParts.join(', ')} WHERE pessoa_id = ? AND pessoa_status = 1`; // Só atualiza ativo
        values.push(id);

        try {
             if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
             const [result] = await pool.query<ResultSetHeader>(query, values);
             if (result.affectedRows === 0) {
                 const existe = await this.findById(id);
                 return existe && Boolean(existe.pessoa_status) ? existe : null;
             }
             return await this.findById(id);
        } catch (error: any) {
            // Tratamento de erro DUP_ENTRY mantido...
             if (error.code === 'ER_DUP_ENTRY') { /* ... tratamento mantido ... */ throw new AppError("Email ou login duplicado.", 409); }
             console.error(`[Repo] Erro ao atualizar pessoa ${id}:`, error);
             throw new AppError(`Erro no banco de dados ao atualizar pessoa ${id}.`, 500, false);
        }
    }

     // Exclusão Lógica (pessoa_status = 0)
     async excluir(id: number): Promise<boolean> { // <<< Assinatura correta (Promise<boolean>)
         const pessoaAtual = await this.findById(id);
         // Só permite desativar se existir e estiver ativo (status=1)
         if (!pessoaAtual || !Boolean(pessoaAtual.pessoa_status)) {
             return false;
         }

         const query = "UPDATE PESSOA SET pessoa_status = 0 WHERE pessoa_id = ?"; // Atualiza status para 0
         try {
             if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
             const [result] = await pool.query<ResultSetHeader>(query, [id]);
             return result.affectedRows > 0; // Retorna true se a linha foi afetada
         } catch (error: any) {
              console.error(`[Repo] Erro ao excluir logica pessoa ${id}:`, error);
              throw new AppError(`Erro no banco de dados ao excluir pessoa ${id}.`, 500, false);
         }
     }

     async atualizarCaminhosFotos(pessoaId: number, paths: { foto_selfie_path?: string; foto_documento_path?: string }): Promise<boolean> {
        const setParts: string[] = [];
        const values: any[] = [];

        if (paths.foto_selfie_path) {
            setParts.push("foto_selfie_path = ?");
            values.push(paths.foto_selfie_path);
        }
        if (paths.foto_documento_path) {
             setParts.push("foto_documento_path = ?");
             values.push(paths.foto_documento_path);
        }

        if (setParts.length === 0) {
            console.warn(`[Repo] Chamado atualizarCaminhosFotos para pessoa ${pessoaId} sem paths.`);
            return false; // Nada a atualizar
        }

        // Atualiza na tabela FISICA associada à PESSOA
        const query = `UPDATE FISICA SET ${setParts.join(', ')} WHERE PESSOA_pessoa_id = ?`;
        values.push(pessoaId);

        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            console.log(`[Repo] Atualizando paths fotos para pessoa ${pessoaId}:`, query, values);
            const [result] = await pool.query<ResultSetHeader>(query, values);
            console.log(`[Repo] Resultado update paths fotos:`, result);
            return result.affectedRows > 0; // Retorna true se atualizou
        } catch (error: any) {
             console.error(`[Repo] Erro ao atualizar caminhos fotos para pessoa ${pessoaId}:`, error);
             // Não lança AppError aqui, serviço pode tentar de novo ou logar
             return false; // Indica falha
        }
    }

    async upsertEndereco(pessoaId: number, endereco: UpdateEnderecoData): Promise<void> {
        const cepSanitizado = (endereco.endereco_cep ?? '').replace(/\D/g, '');
        const numero = endereco.endereco_numero ?? '';
        const rua = endereco.endereco_rua ?? '';
        const bairro = endereco.endereco_bairro ?? '';
        const complemento = endereco.endereco_complemento ?? null;
        const cidadeId = endereco.cidade_id ?? null;

        if (!rua || !numero || !bairro || !cepSanitizado) {
            throw new AppError('Dados de endereço incompletos para atualização.', 400);
        }

        let connection;
        try {
            if (!pool) throw new AppError('Pool de conexão não definido!', 500, false);
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [rows] = await connection.query<RowDataPacket[]>(
                'SELECT endereco_id FROM ENDERECO WHERE PESSOA_pessoa_id = ? LIMIT 1',
                [pessoaId],
            );

            if (rows.length > 0) {
                const enderecoId = rows[0].endereco_id;
                await connection.query<ResultSetHeader>(
                    `UPDATE ENDERECO
                        SET rua = ?,
                            numero = ?,
                            bairro = ?,
                            cep = ?,
                            complemento = ?,
                            CIDADE_cidade_id = ?,
                            ativo = 1
                      WHERE endereco_id = ?`,
                    [rua, numero, bairro, cepSanitizado, complemento, cidadeId, enderecoId],
                );
            } else {
                await connection.query<ResultSetHeader>(
                    `INSERT INTO ENDERECO (
                        PESSOA_pessoa_id,
                        CIDADE_cidade_id,
                        rua,
                        numero,
                        bairro,
                        cep,
                        complemento,
                        ativo)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                    [pessoaId, cidadeId, rua, numero, bairro, cepSanitizado, complemento],
                );
            }

            await connection.commit();
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[Repo Pessoa] Erro ao atualizar endereço:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Erro no banco de dados ao atualizar endereço.', 500, false);
        } finally {
            if (connection) connection.release();
        }
    }
}
