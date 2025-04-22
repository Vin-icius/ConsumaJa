// src/infrastructure/repositories/cidade.mysql.repository.ts
import { Cidade } from '../../domain/entities/cidade.entity';
import { CidadeRepository } from '../../domain/repositories/cidade.repository';
import { pool } from '../database/mysql.connection'; // Certifique-se que esta importação está correta e 'pool' é o Pool do mysql2/promise
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { AppError } from '../../common/errors/app-error';

// Interface CidadeRow (mantida)
interface CidadeRow extends Omit<Cidade, 'estado'>, RowDataPacket {}


export class MySQLCidadeRepository implements CidadeRepository {

    // mapRowToCidade (mantido)
    private mapRowToCidade(row: CidadeRow): Cidade {
        return {
            cidade_id: row.cidade_id,
            cidade_nome: row.cidade_nome,
            regiao_ddd: row.regiao_ddd, // ou row['regiao(DDD)']
            estado_id: row.ESTADO_estado_id,
        };
    }

    async findAll(params?: { nome?: string; estadoSigla?: string; ddd?: string }): Promise<Cidade[]> {
        // Declaração da variável 'query'
        let sqlQuery = `
            SELECT c.*
            FROM CIDADE c
            JOIN ESTADO e ON c.ESTADO_estado_id = e.estado_id
            WHERE 1=1
        `;
        const queryParams: (string | number)[] = [];

        if (params?.nome) {
            sqlQuery += ' AND c.cidade_nome LIKE ?';
            queryParams.push(`%${params.nome}%`);
        }
        if (params?.ddd) {
            sqlQuery += ' AND c.regiao_ddd = ?'; // Ajustar nome da coluna se necessário
            queryParams.push(params.ddd);
        }
        if (params?.estadoSigla) {
            sqlQuery += ' AND e.estado_sigla = ?';
            queryParams.push(params.estadoSigla);
        }

         try {
             // Uso da variável 'sqlQuery' (renomeada para teste)
            const [rows] = await pool.query<CidadeRow[]>(sqlQuery, queryParams);
            return rows.map(this.mapRowToCidade);
         } catch(error: any) {
             console.error("[MySQLCidadeRepository.findAll] Erro ao buscar cidades:", error);
             throw new AppError("Erro ao buscar cidades.", 500, false);
         }
    }

    // ... (restante dos métodos findById, findByEstadoId, etc., como no exemplo anterior) ...

    async findById(id: number): Promise<Cidade | null> {
         try {
             const [rows] = await pool.query<CidadeRow[]>(
                'SELECT * FROM CIDADE WHERE cidade_id = ?',
                [id]
             );
             return rows[0] ? this.mapRowToCidade(rows[0]) : null;
         } catch(error: any) {
             console.error(`[MySQLCidadeRepository.findById] Erro ao buscar cidade ${id}:`, error);
             throw new AppError(`Erro ao buscar cidade ${id}.`, 500, false);
         }
    }

    async findByEstadoId(estadoId: number): Promise<Cidade[]> {
        try {
             const [rows] = await pool.query<CidadeRow[]>(
                'SELECT * FROM CIDADE WHERE ESTADO_estado_id = ?',
                [estadoId]
             );
             return rows.map(this.mapRowToCidade);
        } catch(error: any) {
             console.error(`[MySQLCidadeRepository.findByEstadoId] Erro ao buscar cidades do estado ${estadoId}:`, error);
             throw new AppError(`Erro ao buscar cidades do estado ${estadoId}.`, 500, false);
        }
    }

    async findByNomeAndEstadoId(nome: string, estadoId: number): Promise<Cidade | null> {
         try {
             const [rows] = await pool.query<CidadeRow[]>(
                'SELECT * FROM CIDADE WHERE cidade_nome = ? AND ESTADO_estado_id = ?',
                [nome, estadoId]
             );
             return rows[0] ? this.mapRowToCidade(rows[0]) : null;
        } catch(error: any) {
             console.error(`[MySQLCidadeRepository.findByNomeAndEstadoId] Erro ao buscar cidade "${nome}" no estado ${estadoId}:`, error);
             throw new AppError(`Erro ao buscar cidade "${nome}" no estado ${estadoId}.`, 500, false);
        }
    }

    async create(data: Omit<Cidade, 'cidade_id'>): Promise<Cidade> {
        const { cidade_nome, regiao_ddd, estado_id } = data;
        const insertQuery = 'INSERT INTO CIDADE (cidade_nome, regiao_ddd, ESTADO_estado_id) VALUES (?, ?, ?)'; // Renomeado
        try {
            const [result] = await pool.query<ResultSetHeader>(insertQuery, [cidade_nome, regiao_ddd, estado_id]);
            const insertedId = result.insertId;
            const novaCidade = await this.findById(insertedId);
             if (!novaCidade) {
                throw new AppError("Falha interna ao verificar cidade recém-criada.", 500, false);
            }
            return novaCidade;
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                 const existente = await this.findByNomeAndEstadoId(cidade_nome, estado_id);
                 if (existente) {
                       throw new AppError(`A cidade "${cidade_nome}" já existe no estado ID ${estado_id}.`, 409);
                 } else {
                     throw new AppError(`Erro de duplicação ao criar cidade "${cidade_nome}". Verifique os dados.`, 409);
                 }
            }
             if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new AppError(`O estado com ID ${estado_id} não existe.`, 400);
             }
            console.error("[MySQLCidadeRepository.create] Erro inesperado ao criar cidade:", error);
            throw new AppError("Erro inesperado ao salvar a cidade.", 500, false);
        }
    }

    async update(id: number, data: Partial<Omit<Cidade, 'cidade_id' | 'estado_id'>>): Promise<Cidade | null> {
        const dataForQuery: { [key: string]: any } = {};
         for (const key in data) { dataForQuery[key] = (data as any)[key]; }
        const fields = Object.keys(dataForQuery);
        const values = Object.values(dataForQuery);

        if (fields.length === 0) {
             const cidadeAtual = await this.findById(id);
             // Lança erro se não encontrar a cidade que deveria ser atualizada (ou não)
             if (!cidadeAtual) {
                 throw new AppError(`Cidade com ID ${id} não encontrada.`, 404);
             }
            return cidadeAtual; // Retorna sem fazer update se não há campos
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const updateQuery = `UPDATE CIDADE SET ${setClause} WHERE cidade_id = ?`; // Renomeado

        try {
            const [result] = await pool.query<ResultSetHeader>(updateQuery, [...values, id]);
            if (result.affectedRows === 0) {
                 // Verifica se a cidade existe para diferenciar 404 de outros problemas
                  const existe = await this.findById(id);
                  if (!existe) {
                      throw new AppError(`Cidade com ID ${id} não encontrada para atualização.`, 404);
                  } else {
                      console.warn(`[MySQLCidadeRepository.update] Update para cidade ${id} não afetou linhas.`);
                      return existe; // Retorna a cidade como estava
                  }
            }
            // Busca novamente para garantir retorno dos dados atualizados
            const cidadeAtualizada = await this.findById(id);
             if (!cidadeAtualizada) {
                throw new AppError(`Falha interna ao buscar cidade ${id} após atualização.`, 500, false);
             }
            return cidadeAtualizada;
         } catch (error: any) {
             if (error.code === 'ER_DUP_ENTRY') {
                 const cidadeAtual = await this.findById(id);
                 const estadoId = cidadeAtual ? cidadeAtual.estado_id : 'desconhecido';
                 console.error("Erro de duplicação ao atualizar cidade:", error.message);
                throw new AppError(`O nome "${data.cidade_nome}" já existe para outra cidade no estado ID ${estadoId}.`, 409);
             }
            console.error(`[MySQLCidadeRepository.update] Erro inesperado ao atualizar cidade ${id}:`, error);
            throw new AppError(`Erro inesperado ao atualizar a cidade ${id}.`, 500, false);
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            const [result] = await pool.query<ResultSetHeader>(
                'DELETE FROM CIDADE WHERE cidade_id = ?',
                [id]
            );
            if (result.affectedRows === 0) {
                // Se não afetou linhas, a cidade não existia. Lançar 404? Ou apenas retornar false?
                // Retornar false é mais consistente com a assinatura `Promise<boolean>` indicando sucesso/falha da operação DELEÇÃO.
                // O serviço pode chamar findById antes se precisar diferenciar 'não encontrado' de 'falha ao deletar'.
                return false;
            }
            return true; // Deletou com sucesso
        } catch (error: any) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                 console.error(`Erro ao deletar cidade ${id}: Está sendo referenciada.`, error.message);
                 throw new AppError(`Não é possível excluir a cidade ${id}, pois está em uso.`, 409);
            }
            console.error(`[MySQLCidadeRepository.delete] Erro inesperado ao deletar cidade ${id}:`, error);
            throw new AppError(`Erro inesperado ao excluir a cidade ${id}.`, 500, false);
        }
    }

     async findOrCreate(nome: string, ddd: string, estadoId: number): Promise<Cidade> {
        try {
            let cidade = await this.findByNomeAndEstadoId(nome, estadoId);
            if (cidade) {
                if (cidade.regiao_ddd !== ddd) {
                    console.warn(`Cidade encontrada ${nome}/${estadoId}, mas DDD diverge: DB='${cidade.regiao_ddd}', API='${ddd}'. Atualizando.`);
                    try {
                        const atualizada = await this.update(cidade.cidade_id, { regiao_ddd: ddd });
                        if (atualizada) return atualizada;
                    } catch (updateError) {
                         console.error(`[MySQLCidadeRepository.findOrCreate] Falha ao tentar atualizar DDD para cidade ${cidade.cidade_id}:`, updateError);
                         // Continua com a cidade original se o update falhar
                    }
                }
                return cidade;
            }

            console.log(`Cidade ${nome} / Estado ${estadoId} não encontrada. Criando...`);
            return await this.create({ cidade_nome: nome, regiao_ddd: ddd, estado_id: estadoId });

        } catch (error: any) {
            if (error instanceof AppError) { throw error; } // Relança AppErrors vindos do create/update
            console.error(`[MySQLCidadeRepository.findOrCreate] Erro inesperado para ${nome}/${estadoId}:`, error);
            throw new AppError(`Erro inesperado ao buscar ou criar a cidade "${nome}".`, 500, false);
        }
    }
}