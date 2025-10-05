import { Avaliacao } from '../../domain/entities/avaliacao.entity';
import { AvaliacaoRepository } from '../../domain/repositories/avaliacao.repository';
import { CreateAvaliacaoDto } from '../../interfaces/dtos/create-avaliacao.dto';
import { FiltrosRelatorioAvaliacao, PaginatedRelatorioResponse } from '../../domain/repositories/avaliacao.repository';

export class AvaliacaoService {
    constructor(private avaliacaoRepository: AvaliacaoRepository) {}

    async criar(dto: CreateAvaliacaoDto, pessoaId: number): Promise<Avaliacao> {
        // Validações adicionais (ex: verificar se a venda pertence à pessoa) podem ser adicionadas aqui.
        return this.avaliacaoRepository.criar({
            VENDA_venda_id: dto.venda_id,
            PESSOA_pessoa_id: pessoaId,
            respostas: dto.respostas,
        });
    }

    async gerarRelatorio(filtros: FiltrosRelatorioAvaliacao): Promise<PaginatedRelatorioResponse> {
        // O serviço pode adicionar lógicas aqui, como validar o intervalo de datas, etc.
        return this.avaliacaoRepository.gerarRelatorio(filtros);
    }
}