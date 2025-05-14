import { Endereco } from "../../domain/entities/endereco.entity";
import {
    EnderecoRepository,
    CreateEnderecoRepoData,
    UpdateEnderecoRepoData,
    PaginatedRepositoryResponse
} from "../../domain/repositories/endereco.repository";
import { ListarEnderecosQueryDto } from "../../interfaces/dtos/listar-enderecos-query.dto";
import { pool } from "../database/mysql.connection"; // Assumindo que você tem este
import { AppError } from "../../common/errors/app-error";   // Assumindo que você tem este
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

interface EnderecoRow extends Endereco, RowDataPacket {
    // Campos adicionais do JOIN se houver
    cidade_nome?: string;
    estado_sigla?: string;
    estado_nome?: string;
}

export class EnderecoMySQLRepository implements EnderecoRepository {

    private mapRowToEndereco(row: EnderecoRow): Endereco {
        const endereco: Endereco = {
            endereco_id: row.endereco_id,
            rua: row.rua,
            bairro: row.bairro,
            numero: row.numero,
            cep: row.cep,
            complemento: row.complemento,
            CIDADE_cidade_id: row.CIDADE_cidade_id,
            PESSOA_pessoa_id: row.PESSOA_pessoa_id,
            ativo: Boolean(row.ativo),
        };
        // Popula cidade e estado se vieram do JOIN na query de listagem/busca
        if (row.cidade_nome) {
            endereco.cidade = {
                cidade_id: row.CIDADE_cidade_id,
                cidade_nome: row.cidade_nome,
                estado_id: 0, // Precisaria de estado_id no select para popular corretamente
                ...(row.estado_sigla && { estado: { estado_sigla: row.estado_sigla, estado_nome: row.estado_nome } })
            };
        }
        return endereco;
    }

    async criar(data: CreateEnderecoRepoData): Promise<Endereco> {
        const { rua, bairro, numero, cep, complemento, CIDADE_cidade_id, PESSOA_pessoa_id, ativo } = data;
        const query = `
            INSERT INTO ENDERECO (rua, bairro, numero, cep, complemento, CIDADE_cidade_id, PESSOA_pessoa_id, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, [
                rua, bairro, numero, cep.replace(/\D/g, ''), complemento, CIDADE_cidade_id, PESSOA_pessoa_id, ativo
            ]);
            const insertedId = result.insertId;
            const novoEndereco = await this.buscarPorId(insertedId, true); // true para buscar qualquer status inicialmente
            if (!novoEndereco) throw new AppError("Falha ao criar ou buscar endereço após inserção.", 500);
            return novoEndereco;
        } catch (error: any) {
            console.error("[Repo Endereco] Erro ao criar endereço:", error);
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                 if (error.message.includes('fk_ENDERECO_CIDADE1')) throw new AppError("Cidade inválida.", 400);
                 if (error.message.includes('fk_ENDERECO_PESSOA1')) throw new AppError("Pessoa inválida.", 400);
            }
            throw new AppError("Erro no banco de dados ao criar endereço.", 500, false);
        }
    }

    async listar(filtros: ListarEnderecosQueryDto): Promise<PaginatedRepositoryResponse<Endereco>> {
        // Log para ver os filtros EXATAMENTE como chegam do serviço (após DTO)
        // O DTO ListarEnderecosQueryDto tem 'ativo' como string, mas o plainToClass + validate
        // pode já estar convertendo para booleano no controller se o valor for 'true' ou 'false'
        // ou o seu log está mostrando o objeto ANTES de ser usado na condição.
        // O log crucial é o que você forneceu: "[Repo Endereco] INÍCIO Listar - Filtros DTO recebidos: {"pessoaId":14,"ativo":true}"
        // onde 'ativo' já é um booleano.
        console.log("[Repo Endereco] Listar - Filtros efetivos recebidos:", JSON.stringify(filtros));

        let dataQuery = `
            SELECT e.*, c.cidade_nome, est.estado_sigla, est.estado_nome
            FROM ENDERECO e
            JOIN CIDADE c ON e.CIDADE_cidade_id = c.cidade_id
            JOIN ESTADO est ON c.ESTADO_estado_id = est.estado_id
        `;
        let countQuery = `SELECT COUNT(DISTINCT e.endereco_id) as total FROM ENDERECO e JOIN CIDADE c ON e.CIDADE_cidade_id = c.cidade_id JOIN ESTADO est ON c.ESTADO_estado_id = est.estado_id`;

        const conditions: string[] = [];
        const paramsSql: any[] = [];

        if (filtros.pessoaId) {
            conditions.push("e.PESSOA_pessoa_id = ?");
            paramsSql.push(filtros.pessoaId);
            console.log(`[Repo Endereco] Aplicando filtro pessoaId: ${filtros.pessoaId}`);
        }

        // <<< CORREÇÃO AQUI: Assumir que filtros.ativo chega como booleano do DTO/serviço >>>
        // Ou se ainda chegar como string "true"/"false" do DTO, a conversão explícita é mais segura.
        // Para cobrir ambos os casos (se o DTO o mantiver como string ou se o class-transformer o converter para boolean):
        let valorAtivoParaSql: boolean;
        if (typeof filtros.ativo === 'string') {
            valorAtivoParaSql = filtros.ativo.toLowerCase() === 'true';
        } else if (typeof filtros.ativo === 'boolean') {
            valorAtivoParaSql = filtros.ativo;
        } else {
            valorAtivoParaSql = true; // Default para ativos se não especificado
        }
        conditions.push("e.ativo = ?");
        paramsSql.push(valorAtivoParaSql);
        console.log(`[Repo Endereco] Filtro ativo (valor original DTO: "${filtros.ativo}", tipo: ${typeof filtros.ativo}), Usado no SQL: ${valorAtivoParaSql}`);
        // ---------------------------------------------------------------------------------


        if (conditions.length > 0) {
            const whereClause = " WHERE " + conditions.join(" AND ");
            dataQuery += whereClause;
            countQuery += whereClause;
        }

        dataQuery += " ORDER BY e.rua ASC";

        const page = filtros.page || 1;
        const limit = filtros.limit || 100;
        const offset = (page - 1) * limit;

        dataQuery += " LIMIT ? OFFSET ?";
        const dataParamsFinal = [...paramsSql, limit, offset];
        const countParamsFinal = [...paramsSql]; // Params para contagem sem limit/offset

        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);

            console.log("[Repo Endereco] FINAL Count Query:", countQuery.replace(/\s+/g, ' ').trim());
            console.log("[Repo Endereco] FINAL Count Params:", countParamsFinal);
            const [countRows] = await pool.query<RowDataPacket[]>(countQuery, countParamsFinal);
            const total = countRows[0]?.total || 0;
            console.log("[Repo Endereco] Total de registros (contagem):", total);

            if (total === 0) {
                return { data: [], total: 0 };
            }

            console.log("[Repo Endereco] FINAL Data Query:", dataQuery.replace(/\s+/g, ' ').trim());
            console.log("[Repo Endereco] FINAL Data Params:", dataParamsFinal);
            const [dataRows] = await pool.query<EnderecoRow[]>(dataQuery, dataParamsFinal);
            console.log(`[Repo Endereco] Linhas de dados encontradas: ${dataRows.length}`);

            const data = dataRows.map(row => this.mapRowToEndereco(row));
            return { data, total };

        } catch (error: any) {
            console.error("[Repo Endereco] ERRO DETALHADO ao listar endereços:", error);
            throw new AppError("Erro no banco de dados ao listar endereços.", 500, false);
        }
    }

    async buscarPorId(endereco_id: number, apenasAtivos = true): Promise<Endereco | null> {
        let query = `
            SELECT e.*, c.cidade_nome, est.estado_sigla, est.estado_nome
            FROM ENDERECO e
            JOIN CIDADE c ON e.CIDADE_cidade_id = c.cidade_id
            JOIN ESTADO est ON c.ESTADO_estado_id = est.estado_id
            WHERE e.endereco_id = ?
        `;
        if (apenasAtivos) query += " AND e.ativo = TRUE";

        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [rows] = await pool.query<EnderecoRow[]>(query, [endereco_id]);
            return rows.length > 0 ? this.mapRowToEndereco(rows[0]) : null;
        } catch (error: any) { /* ... */ throw new AppError("Erro DB.", 500, false); }
    }

    async atualizar(endereco_id: number, data: UpdateEnderecoRepoData): Promise<Endereco | null> {
        const fields = Object.keys(data).filter(key => (data as any)[key] !== undefined && key !== 'PESSOA_pessoa_id'); // Não permite alterar PESSOA_pessoa_id aqui
        if (fields.length === 0) {
            return this.buscarPorId(endereco_id); // Nenhum campo para atualizar
        }
        // Trata 'ativo' que vem como string 'true'/'false' do DTO via query, ou boolean
        if (data.ativo !== undefined && typeof data.ativo === 'string') {
            (data as any).ativo = (data.ativo === 'true');
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => (data as any)[field]);
        values.push(endereco_id); // Para o WHERE

        const query = `UPDATE ENDERECO SET ${setClause} WHERE endereco_id = ? AND ativo = TRUE`; // Só atualiza se estiver ativo
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, values);
            if (result.affectedRows === 0) {
                const existe = await this.buscarPorId(endereco_id, false); // Checa se existe, mesmo inativo
                return existe?.ativo ? existe : null; // Retorna se estava ativo e não mudou, ou null
            }
            return this.buscarPorId(endereco_id, false); // Retorna o endereço atualizado (incluindo inativos se acabou de ser inativado)
        } catch (error: any) { /* ... */ throw new AppError("Erro DB.", 500, false); }
    }

    async excluir(endereco_id: number): Promise<boolean> {
        const query = "UPDATE ENDERECO SET ativo = FALSE WHERE endereco_id = ? AND ativo = TRUE";
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, [endereco_id]);
            return result.affectedRows > 0; // True se desativou
        } catch (error: any) { /* ... */ throw new AppError("Erro DB.", 500, false); }
    }
}