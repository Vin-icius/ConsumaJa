import { ItemPromocao, ItemPromocaoPreview } from './item-promocao.entity';

interface FornecedorInfo {
    pessoa_id: number;
    pessoa_nome: string;
}

export interface Promocao {
    promocao_id: number;
    promocao_descricao: string | null;
    inicio: Date;
    fim: Date | null;
    JURIDICA_PESSOA_pessoa_id: number; // FK para Pessoa (Juridica)
    endereco_id: number;             // FK para Endereco (Loja onde a promoção é válida)
    ativo: boolean;

    // Propriedades populadas por JOINs ou chamadas de serviço (opcionais)
    fornecedor?: FornecedorInfo; // Apenas ID e Nome
    // Detalhes completos do endereço seriam buscados no location-service se necessário
    // endereco_descricao_completa?: string; // Exemplo se quisesse denormalizar

    itens_preview?: ItemPromocaoPreview[]; // Para listagem
    itens?: ItemPromocao[];                // Para detalhes
}