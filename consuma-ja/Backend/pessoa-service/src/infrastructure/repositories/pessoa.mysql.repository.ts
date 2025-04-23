import { Pessoa, PessoaStatus, PessoaTipo } from "../../domain/entities/pessoa.entity";
import { Fisica } from "../../domain/entities/fisica.entity";
import { Juridica } from "../../domain/entities/juridica.entity";
import { PessoaRepository, CreatePessoaData, UpdatePessoaData } from "../../domain/repositories/pessoa.repository";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
            pessoa.fisica = {
                PESSOA_pessoa_id: row.pessoa_id,
                pessoa_cpf: row.pessoa_cpf,
                pessoa_documentoValidado: Boolean(row.pessoa_documentoValidado ?? 0),
                pessoa_fotoValidada: Boolean(row.pessoa_fotoValidada ?? 0),
            };
        } else if (row.pessoa_tipo === 'Juridica' && row.cnpj) {
             pessoa.juridica = {
                PESSOA_pessoa_id: row.pessoa_id,
                cnpj: row.cnpj,
                fornecedor_num: row.fornecedor_num ?? null, // Usa ?? null
             };
        }
        return pessoa;
    }

    // --- Métodos de Busca ---
    async findByLoginOrEmailOrDoc(identifier: string): Promise<Pessoa | null> {
        // <<< Incluir p.pessoa_senha na query de login >>>
        const query = `
            SELECT p.*, p.pessoa_senha, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num
            FROM PESSOA p
            LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
            LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
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
            SELECT p.*, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num
            FROM PESSOA p
            LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica'
            LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica'
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
            fisicaData, juridicaData
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

            await connection.commit();

            // Busca a pessoa recém-criada completa
            const novaPessoa = await this.findById(insertedId); // findById agora usa a pool padrão, não a connection
            if (!novaPessoa) throw new AppError("Falha ao buscar pessoa após criação.", 500, false);
            return novaPessoa;

        } catch (error: any) {
            if (connection) await connection.rollback();
            // Tratamento de erro DUP_ENTRY mantido...
             if (error.code === 'ER_DUP_ENTRY') { /* ... tratamento mantido ... */ throw new AppError("Erro duplicado...", 409); }
             console.error("[Repo] Erro ao criar pessoa:", error);
             throw new AppError("Erro no banco de dados ao criar pessoa.", 500, false);
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

     // Listar (Exemplo básico, sem paginação ou filtros complexos)
     async listar(apenasAtivos = true): Promise<Pessoa[]> {
        let query = ` SELECT p.*, f.pessoa_cpf, f.pessoa_documentoValidado, f.pessoa_fotoValidada, j.cnpj, j.fornecedor_num FROM PESSOA p LEFT JOIN FISICA f ON p.pessoa_id = f.PESSOA_pessoa_id AND p.pessoa_tipo = 'Fisica' LEFT JOIN JURIDICA j ON p.pessoa_id = j.PESSOA_pessoa_id AND p.pessoa_tipo = 'Juridica' `;
        if (apenasAtivos) {
            query += " WHERE p.pessoa_status = 1"; // Filtra por status ativo
        }
        query += " ORDER BY p.pessoa_nome";
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [rows] = await pool.query<PessoaRow[]>(query);
            // Mapeia removendo a senha
            return rows.map(row => {
                const pessoa = this.mapRowToPessoa(row);
                delete pessoa.pessoa_senha;
                return pessoa;
            });
        } catch (error: any) {
             console.error("[Repo] Erro ao listar pessoas:", error);
             throw new AppError("Erro DB ao listar pessoas.", 500, false);
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
}
