import { Promocao } from "../entities/promocao.entity";

import { CreateItemPromocaoDto } from "../../interfaces/dtos/create-item-promocao.dto";
import { CreatePromocaoDto } from "../../interfaces/dtos/create-promocao.dto";
import { UpdatePromocaoDto } from "../../interfaces/dtos/update-promocao.dto";
import { ListarPromocoesQueryDto } from "../../interfaces/dtos/listar-promocoes-query.dto";

// Tipos para os dados que o repositório espera
// Omite 'inicio', 'fim' e 'itens' do DTO para redefini-los com tipos corretos
export type CreatePromocaoRepoData = Omit<CreatePromocaoDto, 'inicio' | 'fim' | 'itens'> & {
    inicio: Date; // Espera Date
    fim: Date | null; // Espera Date ou null
    itens: Array<CreateItemPromocaoDto>; // Reusa DTO do item
};

export type UpdatePromocaoRepoData = Omit<UpdatePromocaoDto, 'inicio' | 'fim' | 'itens'> & {
    inicio?: Date; // Opcional e Date
    fim?: Date | null; // Opcional e Date ou null
    itens?: Array<CreateItemPromocaoDto>; // Reusa DTO do item
};


export interface PromocaoRepository {
    criar(data: CreatePromocaoRepoData): Promise<Promocao>;
    // ListarAtivas agora recebe o DTO de filtros
    listar(filtros: ListarPromocoesQueryDto, apenasAtivas?: boolean): Promise<Promocao[]>;
    buscarPorIdComItens(id: number, incluirInativos?: boolean): Promise<Promocao | null>;
    atualizar(id: number, data: UpdatePromocaoRepoData): Promise<Promocao | null>;
    excluir(id: number): Promise<boolean>; // Exclusão lógica
}