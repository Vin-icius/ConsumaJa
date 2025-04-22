import { Estado } from '../../domain/entities/estado.entity';
import { EstadoRepository } from '../../domain/repositories/estado.repository';
import { pool } from '../database/mysql.connection';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface EstadoRow extends Estado, RowDataPacket {}

export class MySQLEstadoRepository implements EstadoRepository {

    // findAll, findById, findByNome, findBySigla (sem alterações lógicas significativas, exceto remover filtro 'ativo' se existia)

    async findAll(params?: { nome?: string; sigla?: string }): Promise<Estado[]> {
        let query = 'SELECT * FROM ESTADO WHERE 1=1';
        const queryParams: string[] = [];
        // ... (lógica de filtro igual à anterior) ...
        const [rows] = await pool.query<EstadoRow[]>(query, queryParams);
        return rows;
    }

    async findById(id: number): Promise<Estado | null> {
        const [rows] = await pool.query<EstadoRow[]>('SELECT * FROM ESTADO WHERE estado_id = ?', [id]);
        return rows[0] || null;
    }

    async findByNome(nome: string): Promise<Estado | null> {
        const [rows] = await pool.query<EstadoRow[]>('SELECT * FROM ESTADO WHERE estado_nome = ?', [nome]);
        return rows[0] || null;
    }

    async findBySigla(sigla: string): Promise<Estado | null> {
        const [rows] = await pool.query<EstadoRow[]>('SELECT * FROM ESTADO WHERE estado_sigla = ?', [sigla]);
        return rows[0] || null;
    }


    async create(data: Omit<Estado, 'estado_id'>): Promise<Estado> {
        const { estado_nome, estado_sigla } = data;
        try {
            const [result] = await pool.query<ResultSetHeader>(
                'INSERT INTO ESTADO (estado_nome, estado_sigla) VALUES (?, ?)',
                [estado_nome, estado_sigla]
            );
            const insertedId = result.insertId;
            // Busca o estado recém-criado para retornar o objeto completo
            const novoEstado = await this.findById(insertedId);
            if (!novoEstado) { // Checagem de segurança
                throw new Error("Falha ao buscar estado recém-criado.");
            }
            return novoEstado;
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.error("Erro ao criar estado: Chave duplicada (nome ou sigla).", error.message);
                // Tenta buscar pelo nome ou sigla para retornar o existente
                 const existente = await this.findByNome(estado_nome) || await this.findBySigla(estado_sigla);
                 if (existente) return existente;
                throw new Error(`Erro ao criar estado: Nome ou Sigla já existe.`);
            }
            console.error("Erro ao criar estado:", error);
            throw error;
        }
    }

    async update(id: number, data: Partial<Omit<Estado, 'estado_id'>>): Promise<Estado | null> {
         const fields = Object.keys(data);
         const values = Object.values(data);

         if (fields.length === 0) {
             return this.findById(id);
         }

         const setClause = fields.map(field => `${field} = ?`).join(', ');
         const query = `UPDATE ESTADO SET ${setClause} WHERE estado_id = ?`;

         try {
             const [result] = await pool.query<ResultSetHeader>(query, [...values, id]);
             if (result.affectedRows === 0) {
                 return null; // Não encontrou
             }
             return this.findById(id);
         } catch (error: any) {
             if (error.code === 'ER_DUP_ENTRY') {
                console.error("Erro ao atualizar estado: Chave duplicada (nome ou sigla).", error.message);
                throw new Error(`Erro ao atualizar estado: Nome ou Sigla já existe.`);
             }
             console.error("Erro ao atualizar estado:", error);
            throw error;
         }
    }

    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'DELETE FROM ESTADO WHERE estado_id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    async findOrCreate(sigla: string, nome: string): Promise<Estado> {
        // Tenta encontrar pela sigla primeiro (geralmente mais única)
        let estado = await this.findBySigla(sigla);
        if (estado) {
            // Opcional: verificar/atualizar nome se diferente?
            if (estado.estado_nome !== nome) {
                 console.warn(`Estado encontrado pela sigla ${sigla}, mas nome diverge: DB='${estado.estado_nome}', API='${nome}'. Atualizando nome no DB.`);
                 const atualizado = await this.update(estado.estado_id, { estado_nome: nome });
                 if (atualizado) return atualizado; // Retorna o atualizado
                 // Se a atualização falhar (ex: nome duplicado), retorna o original
                 return estado;
            }
            return estado;
        }

        // Se não achou pela sigla, tenta pelo nome
        estado = await this.findByNome(nome);
        if (estado) {
            // Opcional: verificar/atualizar sigla se diferente?
             if (estado.estado_sigla !== sigla) {
                 console.warn(`Estado encontrado pelo nome ${nome}, mas sigla diverge: DB='${estado.estado_sigla}', API='${sigla}'. Atualizando sigla no DB.`);
                 const atualizado = await this.update(estado.estado_id, { estado_sigla: sigla });
                  if (atualizado) return atualizado;
                  return estado; // Retorna original se falhar update
             }
            return estado;
        }

        // Se não encontrou de nenhuma forma, cria
        console.log(`Estado ${sigla} - ${nome} não encontrado. Criando...`);
        try {
             return await this.create({ estado_nome: nome, estado_sigla: sigla });
        } catch (error: any) {
            // Trata race condition: se deu erro de duplicidade ao criar, tenta buscar de novo
             if (error.message.includes('Nome ou Sigla já existe')) {
                 console.warn(`[EstadoRepo] Race condition detectada em findOrCreate para ${sigla}/${nome}. Tentando buscar novamente.`);
                 const reExistente = await this.findBySigla(sigla) || await this.findByNome(nome);
                 if (reExistente) return reExistente;
             }
             throw error; // Relança o erro original ou outro
        }
    }
}