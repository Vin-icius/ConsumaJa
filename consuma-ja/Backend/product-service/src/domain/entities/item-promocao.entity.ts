import { Produto } from './produto.entity'; // Produto com imagem_url
import { LoteProd } from './loteprod.entity';
import { Categoria } from './categoria.entity';
import { Marca } from './marca.entity';
import { Tipo } from './tipo.entity';

// Para a listagem na tela inicial (preview)
export interface ItemPromocaoPreview {
    produto_id: number;
    produto_nome: string;
    itemPromocao_valor: number;
    produto_imagem_url: string | null; // Do JOIN com PRODUTO
    imagem_url?: string | null;
}

export interface ItemPromocao {
    // ... outros campos como antes ...
    LOTEPROD_lote_id: number;
    itemPromocao_qtde: number;
    itemPromocao_valor: number;
    produto: { // Objeto produto mais completo
        produto_id: number;
        produto_nome: string;
        produto_medida: string; // <<< Garantir que está aqui
        produto_precoOriginal?: number;
    produto_imagem_url?: string | null;
    imagem_url?: string | null;
        // <<< Adicionar tipos para as relações >>>
        categoria?: Pick<Categoria, 'categoria_nome'> | null;
        marca?: Pick<Marca, 'marca_nome'> | null;
        tipo?: Pick<Tipo, 'tipo_nome'> | null;
    };
    lote: Pick<LoteProd, 'lote_id' | 'lote_codigo' | 'lote_validade' | 'lote_quantidade_atual'>;
}