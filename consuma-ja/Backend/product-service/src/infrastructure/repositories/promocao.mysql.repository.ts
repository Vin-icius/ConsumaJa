import { Promocao } from "../../domain/entities/promocao.entity";
import { ItemPromocaoPreview, ItemPromocao } from "../../domain/entities/item-promocao.entity";
import { PromocaoRepository, CreatePromocaoRepoData, UpdatePromocaoRepoData } from "../../domain/repositories/promocao.repository";
import { ListarPromocoesQueryDto } from "../../interfaces/dtos/listar-promocoes-query.dto";
import { pool } from "../database/mysql.connection";
import { AppError } from "../../common/errors/app-error";
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';

// Tipagem para linha da promoção com preview de itens (pode precisar de GROUP_CONCAT)
interface PromocaoPreviewRow extends RowDataPacket, Omit<Promocao, 'itens_preview' | 'itens' | 'fornecedor'> {
    JURIDICA_PESSOA_pessoa_id: number; // Mantido para consistência com DTO
    fornecedor_nome: string;
    // Para itens_preview, uma forma é buscar separadamente ou usar JSON_ARRAYAGG se MySQL >= 5.7
    // Simplificando: vamos buscar itens_preview em uma query separada no serviço ou mapear aqui
}

interface PromocaoDetailRow extends PromocaoPreviewRow {} // Semelhante, mas itens serão buscados em outra query

interface ItemPromocaoRow extends RowDataPacket {
    // Da tabela ITEM_PROMOCAO
    LOTEPROD_lote_id: number;
    itemPromocao_qtde: number;
    itemPromocao_valor: number;
    // Da tabela LOTEPROD
    lote_codigo: string;
    lote_validade: Date;
    lote_quantidade_atual: number;
    // Da tabela PRODUTO
    produto_id: number;
    produto_nome: string;
    produto_medida: string;
    produto_precoOriginal: number;
    produto_imagem_url: string | null;
}


export class PromocaoMySQLRepository implements PromocaoRepository {

    private mapRowToPromocaoPreview(row: PromocaoPreviewRow): Promocao {
        return {
            promocao_id: row.promocao_id,
            promocao_descricao: row.promocao_descricao,
            inicio: new Date(row.inicio),
            fim: row.fim ? new Date(row.fim) : null,
            JURIDICA_PESSOA_pessoa_id: row.JURIDICA_PESSOA_pessoa_id,
            endereco_id: row.endereco_id, // Adicionar se existir no row
            ativo: Boolean(row.ativo),
            fornecedor: {
                pessoa_id: row.JURIDICA_PESSOA_pessoa_id,
                pessoa_nome: row.fornecedor_nome,
            },
            itens_preview: [] // Será populado pelo serviço com outra query
        };
    }
     private mapRowToPromocaoDetail(row: PromocaoDetailRow): Promocao {
        // Semelhante ao preview, mas itens serão populados separadamente
        return this.mapRowToPromocaoPreview(row) as Promocao; // Cast inicial
    }

    private async fetchItensPreview(promocaoId: number, connection?: PoolConnection): Promise<ItemPromocaoPreview[]> {
        const queryRunner = connection || pool;
        const queryItens = `
            SELECT
                p.produto_id, p.produto_nome, p.produto_imagem_url,
                ip.itemPromocao_valor
            FROM ITEM_PROMOCAO ip
            JOIN LOTEPROD lp ON ip.LOTEPROD_lote_id = lp.lote_id
            JOIN PRODUTO p ON lp.produto_id = p.produto_id
            WHERE ip.PROMOCAO_promocao_id = ? AND p.ativo = TRUE
            LIMIT 2; -- Limite para preview
        `;
        const [itemRows] = await queryRunner.query<RowDataPacket[]>(queryItens, [promocaoId]);
        return itemRows.map((ir: any) => ({
            produto_id: ir.produto_id,
            produto_nome: ir.produto_nome,
            itemPromocao_valor: Number(ir.itemPromocao_valor),
            produto_imagem_url: ir.produto_imagem_url,
        }));
    }

    private async fetchItensDetail(promocaoId: number, connection?: PoolConnection): Promise<ItemPromocao[]> {
        const queryItens = `
            SELECT
                ip.LOTEPROD_lote_id, ip.itemPromocao_qtde, ip.itemPromocao_valor,
                lp.lote_codigo, lp.lote_validade, lp.lote_quantidade_atual,
                p.produto_id, p.produto_nome, p.produto_medida, p.produto_precoOriginal, p.produto_imagem_url,
                c.categoria_nome AS produto_categoria_nome,
                m.marca_nome AS produto_marca_nome,
                t.tipo_nome AS produto_tipo_nome
            FROM ITEM_PROMOCAO ip
            JOIN LOTEPROD lp ON ip.LOTEPROD_lote_id = lp.lote_id
            JOIN PRODUTO p ON lp.produto_id = p.produto_id
            LEFT JOIN CATEGORIA_PRODUTO c ON p.CATEGORIA_PRODUTO_categoria_id = c.categoria_id
            LEFT JOIN MARCA_PRODUTO m ON p.MARCA_PRODUTO_marca_id = m.marca_id
            LEFT JOIN TIPO_PRODUTO t ON p.TIPO_PRODUTO_tipo_id = t.tipo_id
            WHERE ip.PROMOCAO_promocao_id = ? AND p.ativo = TRUE AND lp.lote_quantidade_atual > 0 AND lp.ativo = TRUE;
        `;
        
        // Determina se usa a conexão da transação ou a pool principal
        const queryRunner = connection || pool;
    
        try {
            if (!queryRunner) {
                // Esta checagem é mais por segurança, pois 'pool' deve sempre existir.
                // 'connection' pode ser undefined se a função for chamada fora de uma transação.
                console.error("[Repo Promocao] fetchItensDetail - Pool/Conexão não definido!");
                throw new AppError("Configuração de banco de dados inválida.", 500, false);
            }
            
            console.log(`[Repo Promocao] fetchItensDetail - Buscando itens para promocao_id: ${promocaoId}`);
            // Tipar itemRows para corresponder aos campos selecionados e RowDataPacket
            const [itemRows] = await queryRunner.query<RowDataPacket[]>(queryItens, [promocaoId]);
            console.log(`[Repo Promocao] fetchItensDetail - Itens encontrados: ${itemRows.length}`);
            
            return itemRows.map(row => ({
                LOTEPROD_lote_id: row.LOTEPROD_lote_id,
                itemPromocao_qtde: row.itemPromocao_qtde,
                itemPromocao_valor: Number(row.itemPromocao_valor),
                produto: {
                    produto_id: row.produto_id,
                    produto_nome: row.produto_nome,
                    produto_medida: row.produto_medida,
                    produto_precoOriginal: Number(row.produto_precoOriginal),
                    produto_imagem_url: row.produto_imagem_url,
                    categoria: row.produto_categoria_nome ? { categoria_nome: row.produto_categoria_nome } : null,
                    marca: row.produto_marca_nome ? { marca_nome: row.produto_marca_nome } : null,
                    tipo: row.produto_tipo_nome ? { tipo_nome: row.produto_tipo_nome } : null,
                },
                lote: {
                    lote_id: row.LOTEPROD_lote_id,
                    lote_codigo: row.lote_codigo,
                    lote_validade: new Date(row.lote_validade), // Converte para Date aqui
                    lote_quantidade_atual: row.lote_quantidade_atual,
                },
            } as ItemPromocao)); // Ajuste o 'as ItemPromocao' conforme sua interface ItemPromocao
        } catch (error: any) {
            // <<< GARANTIR QUE O CATCH LOGA E LANÇA UM ERRO >>>
            console.error(`[Repo Promocao] Erro em fetchItensDetail para promocao_id ${promocaoId}:`, error);
            throw new AppError(`Erro no BD ao buscar itens da promoção ${promocaoId}.`, 500, false);
            // ----------------------------------------------------
        }
    }

    async criar(data: CreatePromocaoRepoData): Promise<Promocao> {
        const { promocao_descricao, inicio, fim, JURIDICA_PESSOA_pessoa_id, endereco_id, itens } = data;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const promocaoQuery = `
                INSERT INTO PROMOCAO (promocao_descricao, inicio, fim, JURIDICA_PESSOA_pessoa_id, endereco_id, ativo)
                VALUES (?, ?, ?, ?, ?, TRUE)
            `;
            const [resultPromocao] = await connection.query<ResultSetHeader>(promocaoQuery, [
                promocao_descricao, inicio, fim, JURIDICA_PESSOA_pessoa_id, endereco_id
            ]);
            const promocaoId = resultPromocao.insertId;

            if (itens && itens.length > 0) {
                const itemQuery = `
                    INSERT INTO ITEM_PROMOCAO (PROMOCAO_promocao_id, LOTEPROD_lote_id, itemPromocao_qtde, itemPromocao_valor)
                    VALUES ?`; // Bulk insert
                const itemValues = itens.map(item => [promocaoId, item.LOTEPROD_lote_id, item.itemPromocao_qtde, item.itemPromocao_valor]);
                await connection.query(itemQuery, [itemValues]);
            }
            await connection.commit();
            const novaPromocao = await this.buscarPorIdComItens(promocaoId, true); // Busca incluindo inativos para garantir que pegue a recém-criada
            if (!novaPromocao) throw new AppError("Falha ao buscar promoção após criação.", 500, false);
            return novaPromocao;
        } catch (error: any) {
            await connection.rollback();
            // Tratar ER_NO_REFERENCED_ROW_2 para FKs de JURIDICA_PESSOA_pessoa_id, endereco_id, LOTEPROD_lote_id
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                throw new AppError("Erro de referência: Fornecedor, Endereço ou Lote de Produto inválido(s).", 400);
            }
            console.error("[Repo] Erro ao criar promoção:", error);
            throw new AppError("Erro no banco de dados ao criar promoção.", 500, false);
        } finally {
            connection.release();
        }
    }

    async listar(filtros: ListarPromocoesQueryDto, apenasAtivasCliente = true): Promise<Promocao[]> {
        let queryParams: any[] = [];
        let baseQuery = `
            SELECT DISTINCT
                pr.promocao_id,
                pr.promocao_descricao,
                pr.inicio,
                pr.fim,
                pr.JURIDICA_PESSOA_pessoa_id,
                pr.endereco_id,
                pr.ativo,
                pj.pessoa_nome as fornecedor_nome
            FROM PROMOCAO pr
            JOIN PESSOA pj ON pr.JURIDICA_PESSOA_pessoa_id = pj.pessoa_id
            LEFT JOIN ITEM_PROMOCAO ip ON pr.promocao_id = ip.PROMOCAO_promocao_id
            LEFT JOIN LOTEPROD lp ON ip.LOTEPROD_lote_id = lp.lote_id
            LEFT JOIN PRODUTO p ON lp.produto_id = p.produto_id
            LEFT JOIN CATEGORIA_PRODUTO cat ON p.CATEGORIA_PRODUTO_categoria_id = cat.categoria_id
        `;

        const whereConditions: string[] = [];

        if (apenasAtivasCliente) { // Para tela de início do cliente
            whereConditions.push("pr.ativo = TRUE");
            whereConditions.push("NOW() >= pr.inicio");
            whereConditions.push("(pr.fim IS NULL OR NOW() <= pr.fim)");
        } else { // Para tela de admin "Gerenciar Promoções"
            if (filtros.status === 'ATIVA') {
                whereConditions.push("pr.ativo = TRUE");
                whereConditions.push("NOW() >= pr.inicio");
                whereConditions.push("(pr.fim IS NULL OR NOW() <= pr.fim)");
            } else if (filtros.status === 'INATIVA') {
                whereConditions.push("pr.ativo = FALSE");
            } else if (filtros.status === 'EXPIRADA') {
                whereConditions.push("pr.ativo = TRUE"); // Ainda pode estar ativa mas expirada
                whereConditions.push("pr.fim IS NOT NULL AND NOW() > pr.fim");
            }
            // Se filtros.status for 'TODAS' ou undefined, não adiciona filtro de status/data de validade
        }

        if (filtros.searchTerm) {
            const searchTermLike = `%${filtros.searchTerm}%`;
            if (filtros.searchType === 'produto') {
                whereConditions.push("p.produto_nome LIKE ?");
                queryParams.push(searchTermLike);
            } else if (filtros.searchType === 'fornecedor') {
                whereConditions.push("pj.pessoa_nome LIKE ?");
                queryParams.push(searchTermLike);
            } else {
                whereConditions.push("(p.produto_nome LIKE ? OR pj.pessoa_nome LIKE ?)");
                queryParams.push(searchTermLike, searchTermLike);
            }
        }
        if (filtros.categoriaId) {
            whereConditions.push("p.CATEGORIA_PRODUTO_categoria_id = ?");
            queryParams.push(filtros.categoriaId);
        }

        if (whereConditions.length > 0) { baseQuery += " WHERE " + whereConditions.join(" AND "); }
        baseQuery += " ORDER BY pr.inicio DESC, pr.promocao_id DESC";
        try {
            if (!pool) throw new AppError("Pool...", 500, false);
            const [rows] = await pool.query<PromocaoPreviewRow[]>(baseQuery, queryParams);
            if (!rows) return [];

            const promocoesComPreview = await Promise.all(rows.map(async (row) => {
                const promocaoBase = this.mapRowToPromocaoPreview(row);
                try {
                    promocaoBase.itens_preview = await this.fetchItensPreview(row.promocao_id);
                } catch (itemError) {
                    console.error(`[Repo Promocao] Erro ao buscar itens_preview para ID ${row.promocao_id}:`, itemError);
                    promocaoBase.itens_preview = [];
                }
                return promocaoBase;
            }));
            return promocoesComPreview;
        } catch (error: any) {
            console.error("[Repo Promocao] Erro ao listar promoções:", error);
            throw new AppError("Erro DB ao listar promoções.", 500, false);
        }
    }

    async buscarPorIdComItens(id: number, incluirInativos = false): Promise<Promocao | null> {
        let query = `
            SELECT pr.*, pj.pessoa_nome as fornecedor_nome
            FROM PROMOCAO pr
            JOIN PESSOA pj ON pr.JURIDICA_PESSOA_pessoa_id = pj.pessoa_id -- <<< CONDIÇÃO DO JOIN CORRIGIDA
            WHERE pr.promocao_id = ?
        `;
        if (!incluirInativos) {
            query += " AND pr.ativo = TRUE";
        }
        console.log(`[Repo Promocao] buscarPorIdComItens - Query principal para ID ${id}: ${query.replace(/\s+/g, ' ').trim()}`);

        try {
            if (!pool) throw new AppError("Pool de conexão não definido!", 500, false);
            const [rows] = await pool.query<PromocaoDetailRow[]>(query, [id]);
            
            if (rows.length === 0) {
                console.log(`[Repo Promocao] Nenhuma promoção encontrada com ID ${id} (ou inativa).`);
                return null;
            }
            console.log(`[Repo Promocao] Promoção base encontrada para ID ${id}. Buscando itens...`);

            const promocaoBase = this.mapRowToPromocaoDetail(rows[0]);
            // Busca todos os itens detalhados
            promocaoBase.itens = await this.fetchItensDetail(id);
            
            console.log(`[Repo Promocao] Promoção ID ${id} com ${promocaoBase.itens?.length || 0} itens carregada.`);
            return promocaoBase;
        } catch (error: any) {
            // Este console.error é o que queremos ver no terminal do backend
            console.error(`[Repo Promocao] Erro ao buscar promoção com itens ${id}:`, error);
            throw new AppError(`Erro no BD ao buscar promoção ${id}.`, 500, false);
        }
    }

    async atualizar(id: number, data: UpdatePromocaoRepoData): Promise<Promocao | null> {
        const { promocao_descricao, inicio, fim, itens } = data;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Atualiza dados da tabela PROMOCAO (se houver)
            const promoFieldsToUpdate: any = {};
            if (promocao_descricao !== undefined) promoFieldsToUpdate.promocao_descricao = promocao_descricao;
            if (inicio !== undefined) promoFieldsToUpdate.inicio = inicio;
            if (fim !== undefined) promoFieldsToUpdate.fim = fim; // Pode ser null

            if (Object.keys(promoFieldsToUpdate).length > 0) {
                 const updatePromocaoQuery = "UPDATE PROMOCAO SET ? WHERE promocao_id = ? AND ativo = TRUE";
                 const [resultUpdate] = await connection.query<ResultSetHeader>(updatePromocaoQuery, [promoFieldsToUpdate, id]);
                 if (resultUpdate.affectedRows === 0) {
                      // Promoção não existe, inativa ou nenhum campo realmente mudou
                      await connection.rollback();
                      const existe = await this.buscarPorIdComItens(id, true); // Check
                      return existe && existe.ativo ? existe : null;
                 }
            }

            // Se itens foram passados, sobrescreve os itens existentes para esta promoção
            if (itens && itens.length > 0) {
                // 1. Deleta itens antigos da promoção
                await connection.query("DELETE FROM ITEM_PROMOCAO WHERE PROMOCAO_promocao_id = ?", [id]);
                // 2. Insere novos itens
                const itemQuery = `INSERT INTO ITEM_PROMOCAO (PROMOCAO_promocao_id, LOTEPROD_lote_id, itemPromocao_qtde, itemPromocao_valor) VALUES ?`;
                const itemValues = itens.map(item => [id, item.LOTEPROD_lote_id, item.itemPromocao_qtde, item.itemPromocao_valor]);
                await connection.query(itemQuery, [itemValues]);
            } else if (itens && itens.length === 0) {
                // Se um array vazio de itens for passado, remove todos os itens
                await connection.query("DELETE FROM ITEM_PROMOCAO WHERE PROMOCAO_promocao_id = ?", [id]);
            }
            // Se 'itens' for undefined, não mexe nos itens existentes.

            await connection.commit();
            return this.buscarPorIdComItens(id);
        } catch (error: any) {
            await connection.rollback();
             if (error.code === 'ER_NO_REFERENCED_ROW_2') { throw new AppError("Erro de referência: Lote de Produto inválido.", 400); }
            console.error(`[Repo] Erro ao atualizar promoção ${id}:`, error);
            throw new AppError(`Erro no BD ao atualizar promoção ${id}.`, 500, false);
        } finally {
            connection.release();
        }
    }

    async excluir(id: number): Promise<boolean> {
        const query = "UPDATE PROMOCAO SET ativo = FALSE WHERE promocao_id = ? AND ativo = TRUE";
        try {
            const [result] = await pool.query<ResultSetHeader>(query, [id]);
            return result.affectedRows > 0;
        } catch (error: any) {
            console.error(`[Repo] Erro ao excluir promoção ${id}:`, error);
            throw new AppError(`Erro no BD ao excluir promoção ${id}.`, 500, false);
        }
    }
}