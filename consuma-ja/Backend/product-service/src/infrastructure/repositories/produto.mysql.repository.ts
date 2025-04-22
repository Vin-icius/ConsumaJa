import { Produto } from "../../domain/entities/produto.entity";
import { Categoria } from "../../domain/entities/categoria.entity";
import { Marca } from "../../domain/entities/marca.entity";
import { Tipo } from "../../domain/entities/tipo.entity";
import { ProdutoRepository, CreateProdutoData, UpdateProdutoData } from "../../domain/repositories/produto.repository";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Interface para linha do DB com dados das tabelas relacionadas via JOIN
// Usa alias para colunas de tabelas relacionadas para evitar ambiguidade
interface ProdutoRow extends RowDataPacket {
    produto_id: number;
    produto_nome: string;
    produto_status: 'APROVADO' | 'PENDENTE' | 'REJEITADO';
    produto_medida: string;
    produto_precoOriginal: number;
    motivo: string | null;
    descricao: string | null;
    data_registro: Date;
    data_aprovacao: Date | null;
    data_exclusao: Date | null;
    produto_ativo: boolean;

    // Campos FK diretos da tabela Produto
    CATEGORIA_PRODUTO_categoria_id: number;
    MARCA_PRODUTO_marca_id: number;
    TIPO_PRODUTO_tipo_id: number;

    // Campos das tabelas relacionadas (com alias)
    categoria_nome: string | null;
    categoria_ativo: boolean | null;
    marca_nome: string | null;
    marca_ativo: boolean | null;
    tipo_nome: string | null;
    tipo_ativo: boolean | null;
}


export class ProdutoMySQLRepository implements ProdutoRepository {

    // Helper para mapear linha completa para entidade Produto
    private mapRowToProduto(row: ProdutoRow): Produto {
         // Cria objetos relacionados SOMENTE se existirem e estiverem ATIVOS
         const categoria: Categoria | null = row.CATEGORIA_PRODUTO_categoria_id && row.categoria_ativo ? {
             categoria_id: row.CATEGORIA_PRODUTO_categoria_id,
             categoria_nome: row.categoria_nome!, // Usa '!' pois JOIN garante que não será null se ativo=true
             ativo: true,
         } : null;

         const marca: Marca | null = row.MARCA_PRODUTO_marca_id && row.marca_ativo ? {
             marca_id: row.MARCA_PRODUTO_marca_id,
             marca_nome: row.marca_nome!,
             ativo: true,
         } : null;

          const tipo: Tipo | null = row.TIPO_PRODUTO_tipo_id && row.tipo_ativo ? {
             tipo_id: row.TIPO_PRODUTO_tipo_id,
             tipo_nome: row.tipo_nome!,
             ativo: true,
         } : null;

         // Cria objeto Produto (usando 'as Produto' para garantir tipo)
        const produto = {
            produto_id: row.produto_id,
            produto_nome: row.produto_nome,
            produto_status: row.produto_status,
            produto_medida: row.produto_medida,
            produto_precoOriginal: Number(row.produto_precoOriginal),
            motivo: row.motivo,
            descricao: row.descricao,
            data_registro: new Date(row.data_registro),
            data_aprovacao: row.data_aprovacao ? new Date(row.data_aprovacao) : null,
            data_exclusao: row.data_exclusao ? new Date(row.data_exclusao) : null,
            ativo: Boolean(row.produto_ativo),

            CATEGORIA_PRODUTO_categoria_id: row.CATEGORIA_PRODUTO_categoria_id,
            MARCA_PRODUTO_marca_id: row.MARCA_PRODUTO_marca_id,
            TIPO_PRODUTO_tipo_id: row.TIPO_PRODUTO_tipo_id,

            categoria: categoria,
            marca: marca,
            tipo: tipo,
        } as Produto;
        return produto;
    }

    private readonly BASE_SELECT_QUERY = `
        SELECT
            p.*, p.ativo as produto_ativo,
            c.categoria_nome, c.ativo as categoria_ativo,
            m.marca_nome, m.ativo as marca_ativo,
            t.tipo_nome, t.ativo as tipo_ativo
        FROM PRODUTO p
        LEFT JOIN CATEGORIA_PRODUTO c ON p.CATEGORIA_PRODUTO_categoria_id = c.categoria_id
        LEFT JOIN MARCA_PRODUTO m ON p.MARCA_PRODUTO_marca_id = m.marca_id
        LEFT JOIN TIPO_PRODUTO t ON p.TIPO_PRODUTO_tipo_id = t.tipo_id
    `;

    // Método para buscar por nome
    async findByNome(nome: string): Promise<Produto | null> {
       // Busca produto ativo com esse nome
       const query = this.BASE_SELECT_QUERY + " WHERE p.produto_nome = ? AND p.ativo = TRUE LIMIT 1";
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<ProdutoRow[]>(query, [nome]);
            return rows.length > 0 ? this.mapRowToProduto(rows[0]) : null;
        } catch (error: any) {
             console.error("[Repo] Erro ao buscar produto por nome:", error);
             throw new AppError("Erro no banco de dados ao buscar produto por nome.", 500, false);
        }
    }

    async criar(data: CreateProdutoData): Promise<Produto> {
        const {
            produto_nome, produto_medida, produto_precoOriginal, descricao,
            CATEGORIA_PRODUTO_categoria_id, MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id
        } = data;

        const query = `
            INSERT INTO PRODUTO (
                produto_nome, produto_status, produto_medida, produto_precoOriginal,
                descricao, data_registro, ativo,
                CATEGORIA_PRODUTO_categoria_id, MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id
            ) VALUES (?, 'PENDENTE', ?, ?, ?, NOW(), TRUE, ?, ?, ?)
        `;
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, [
                produto_nome, produto_medida, produto_precoOriginal, descricao,
                CATEGORIA_PRODUTO_categoria_id, MARCA_PRODUTO_marca_id, TIPO_PRODUTO_tipo_id
            ]);
            const insertedId = result.insertId;
            const novoProduto = await this.buscarPorId(insertedId, true);
            if (!novoProduto) throw new AppError("Falha ao buscar produto após criação.", 500, false);
            return novoProduto;
        } catch (error: any) {
             if (error.code === 'ER_DUP_ENTRY') { throw new AppError(`Produto "${produto_nome}" já existe (constraint UNIQUE violada).`, 409); }
             if (error.code === 'ER_NO_REFERENCED_ROW_2') { throw new AppError("Erro de referência: Categoria, Marca ou Tipo inválido(a) ou inativo(a).", 400); }
             console.error("[Repo] Erro ao criar produto:", error);
             throw new AppError("Erro no banco de dados ao criar produto.", 500, false);
        }
    }

    async listar(apenasAtivos = true, filtros: any = {}): Promise<Produto[]> {
        let query = this.BASE_SELECT_QUERY;
        const params: any[] = [];
        const whereConditions: string[] = [];

        if (apenasAtivos) {
            whereConditions.push("p.ativo = TRUE");
        }

        if (filtros.nome) {
             whereConditions.push("p.produto_nome LIKE ?");
             params.push(`%${filtros.nome}%`);
        }
        if (filtros.categoriaId) {
            whereConditions.push("p.CATEGORIA_PRODUTO_categoria_id = ?");
            params.push(filtros.categoriaId);
        }
         if (filtros.status) {
            whereConditions.push("p.produto_status = ?");
            params.push(filtros.status);
        }

        if (whereConditions.length > 0) {
            query += " WHERE " + whereConditions.join(" AND ");
        }

        query += " ORDER BY p.produto_nome";

        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<ProdutoRow[]>(query, params);
            return rows.map(this.mapRowToProduto);
        } catch (error: any) {
            console.error("[Repo] Erro ao listar produtos:", error);
            throw new AppError("Erro no banco de dados ao listar produtos.", 500, false);
        }
    }

     async buscarPorId(id: number, incluirInativos = false): Promise<Produto | null> {
        let query = this.BASE_SELECT_QUERY + " WHERE p.produto_id = ?";
        if (!incluirInativos) {
            query += " AND p.ativo = TRUE";
        }
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<ProdutoRow[]>(query, [id]);
            return rows.length > 0 ? this.mapRowToProduto(rows[0]) : null;
        } catch (error: any) {
             console.error(`[Repo] Erro ao buscar produto ${id}:`, error);
             throw new AppError(`Erro no banco de dados ao buscar produto ${id}.`, 500, false);
        }
    }

    async atualizar(id: number, data: UpdateProdutoData): Promise<Produto | null> {
        const fields = Object.keys(data).filter(key => data[key as keyof UpdateProdutoData] !== undefined);
        const fieldMapping: { [key: string]: string } = {
            CATEGORIA_PRODUTO_categoria_id: 'CATEGORIA_PRODUTO_categoria_id',
            MARCA_PRODUTO_marca_id: 'MARCA_PRODUTO_marca_id',
            TIPO_PRODUTO_tipo_id: 'TIPO_PRODUTO_tipo_id',
        };
    
        const setParts: string[] = [];
        const values: any[] = [];
    
        fields.forEach(key => {
            
            if (!['produto_id', 'produto_status', 'ativo', 'data_registro', 'data_aprovacao', 'data_exclusao', 'motivo'].includes(key)) {
                 const columnName = fieldMapping[key] || key;
                 setParts.push(`${columnName} = ?`);
                 values.push(data[key as keyof UpdateProdutoData]);
            }
        });
    
        if (setParts.length === 0) {
             console.log(`[Repo] Nenhum campo válido para atualizar produto ${id}. Retornando registro atual.`);
             return this.buscarPorId(id);
        }
    
        const query = `UPDATE PRODUTO SET ${setParts.join(', ')} WHERE produto_id = ? AND ativo = TRUE`;
        values.push(id);
    
        console.log(`[Repo] Executando UPDATE para produto ${id}:`, query, values); // Log da query
    
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, values);
    
            console.log(`[Repo] Resultado UPDATE produto ${id}:`, result); // Log do resultado
    
            if (result.affectedRows === 0) {
                const existe = await this.buscarPorId(id, true);
                console.log(`[Repo] affectedRows = 0 para produto ${id}. Registro existente (ativo/inativo):`, existe);
                return existe && existe.ativo ? existe : null;
            }
            
            const produtoAtualizado = await this.buscarPorId(id);
             if (!produtoAtualizado) { // Checagem de segurança
                 throw new AppError(`Falha ao buscar produto ${id} após atualização bem-sucedida.`, 500, false);
             }
             console.log(`[Repo] Produto ${id} atualizado com sucesso.`);
            return produtoAtualizado;
        } catch (error: any) {
             if (error.code === 'ER_DUP_ENTRY') { throw new AppError(`Erro de duplicação ao atualizar produto ${id}. Verifique campos únicos.`, 409); }
             if (error.code === 'ER_NO_REFERENCED_ROW_2') { throw new AppError("Erro de referência: Categoria, Marca ou Tipo inválido(a) ou inativo(a) na atualização.", 400); }
             console.error(`[Repo] Erro ao atualizar produto ${id}:`, error);
             throw new AppError(`Erro no banco de dados ao atualizar produto ${id}.`, 500, false);
        }
      }

    // Exclusão lógica de Produto
    async excluir(id: number): Promise<boolean> {
        const produtoAtual = await this.buscarPorId(id, false);
        if (!produtoAtual) return false;

        const query = "UPDATE PRODUTO SET ativo = FALSE, data_exclusao = NOW() WHERE produto_id = ? AND ativo = TRUE";
        try {
             if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
             const [result] = await pool.query<ResultSetHeader>(query, [id]);
             return result.affectedRows > 0;
        } catch (error: any) {
             console.error(`[Repo] Erro ao excluir logica produto ${id}:`, error);
             throw new AppError(`Erro no banco de dados ao excluir produto ${id}.`, 500, false);
        }
    }

    // Métodos de Aprovação
    async listarPendentes(apenasAtivos = true): Promise<Produto[]> {
        let query = this.BASE_SELECT_QUERY + " WHERE p.produto_status = 'PENDENTE'";
        if (apenasAtivos) {
             query += " AND p.ativo = TRUE";
        }
        query += " ORDER BY p.data_registro DESC";
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<ProdutoRow[]>(query);
            return rows.map(this.mapRowToProduto);
        } catch (error: any) {
            console.error("[Repo] Erro ao listar produtos pendentes:", error);
            throw new AppError("Erro no banco de dados ao listar produtos pendentes.", 500, false);
        }
    }

    async aprovar(id: number): Promise<Produto | null> {
        const query = "UPDATE PRODUTO SET produto_status = 'APROVADO', data_aprovacao = NOW(), motivo = NULL WHERE produto_id = ? AND ativo = TRUE AND produto_status = 'PENDENTE'";
        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [result] = await pool.query<ResultSetHeader>(query, [id]);
            if (result.affectedRows === 0) {
                const produto = await this.buscarPorId(id, true);
                if (!produto || !produto.ativo || produto.produto_status !== 'PENDENTE') return null;
            }
            return await this.buscarPorId(id);
        } catch (error: any) {
             console.error(`[Repo] Erro ao aprovar produto ${id}:`, error);
             throw new AppError(`Erro no banco de dados ao aprovar produto ${id}.`, 500, false);
        }
    }

    async rejeitar(id: number, motivo: string): Promise<Produto | null> {
         const query = "UPDATE PRODUTO SET produto_status = 'REJEITADO', motivo = ? WHERE produto_id = ? AND ativo = TRUE AND produto_status = 'PENDENTE'";
         try {
             if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
             const [result] = await pool.query<ResultSetHeader>(query, [motivo, id]);
             if (result.affectedRows === 0) {
                  const produto = await this.buscarPorId(id, true);
                  if (!produto || !produto.ativo || produto.produto_status !== 'PENDENTE') return null;
             }
             return await this.buscarPorId(id);
         } catch (error: any) {
              console.error(`[Repo] Erro ao rejeitar produto ${id}:`, error);
              throw new AppError(`Erro no banco de dados ao rejeitar produto ${id}.`, 500, false);
         }
    }
}