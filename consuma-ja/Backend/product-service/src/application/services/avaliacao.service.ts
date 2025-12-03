import { Avaliacao } from '../../domain/entities/avaliacao.entity';
import { AvaliacaoRepository, ListarAvaliacoesResult } from '../../domain/repositories/avaliacao.repository';
import { VendaRepository } from '../../domain/repositories/venda.repository';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import { CreateAvaliacaoDto } from '../../interfaces/dtos/create-avaliacao.dto';
import { ListarAvaliacoesQueryDto } from '../../interfaces/dtos/listar-avaliacoes-query.dto';
import { AppError } from '../../common/errors/app-error';
import { JwtPayload } from '../../common/utils/jwt.util';

export class AvaliacaoService {
    constructor(
        private avaliacaoRepository: AvaliacaoRepository,
        private vendaRepository: VendaRepository,
        private notificationRepository: NotificationRepository,
    ) {}

    async criar(dto: CreateAvaliacaoDto, pessoaId: number): Promise<Avaliacao> {
        const venda = await this.vendaRepository.buscarPorId(dto.venda_id);
        if (!venda) {
            throw new AppError('Venda não encontrada.', 404);
        }

        if (venda.pessoa_id !== pessoaId) {
            throw new AppError('Venda não pertence ao usuário autenticado.', 403);
        }

        const avaliacao = await this.avaliacaoRepository.criar({
            VENDA_venda_id: dto.venda_id,
            PESSOA_pessoa_id: venda.pessoa_id,
            respostas: dto.respostas,
            descricao: dto.descricao?.trim() || null,
        });

        if (venda.fornecedor_pessoa_id) {
            await this.notificationRepository.criar({
                pessoaId: venda.fornecedor_pessoa_id,
                titulo: 'Nova avaliação recebida',
                mensagem: `O pedido #${venda.venda_id} recebeu uma nova avaliação do cliente.`,
                tipo: 'VENDA_AVALIACAO',
                destinatarioTipo: 'FORNECEDOR',
                vendaId: venda.venda_id,
                rotaDestino: 'Relatorios',
                payload: { avaliacaoId: avaliacao.avaliacao_id, vendaId: venda.venda_id },
            });
        }

        return avaliacao;
    }

    async listar(query: ListarAvaliacoesQueryDto, requester: JwtPayload): Promise<ListarAvaliacoesResult> {
        const isAdmin = requester.tipo === 'Admin';
        const isFornecedor = requester.tipo === 'Juridica' || requester.tipo === 'Fornecedor';

        if (!isAdmin && !isFornecedor) {
            throw new AppError('Acesso aos relatórios restrito.', 403);
        }

        const notaMin = query.notaMin !== undefined ? Number(query.notaMin) : undefined;
        const notaMax = query.notaMax !== undefined ? Number(query.notaMax) : undefined;

        if (notaMin !== undefined && (Number.isNaN(notaMin) || notaMin < 1 || notaMin > 5)) {
            throw new AppError('Nota mínima inválida. Utilize valores entre 1 e 5.', 400);
        }

        if (notaMax !== undefined && (Number.isNaN(notaMax) || notaMax < 1 || notaMax > 5)) {
            throw new AppError('Nota máxima inválida. Utilize valores entre 1 e 5.', 400);
        }

        if (notaMin !== undefined && notaMax !== undefined && notaMin > notaMax) {
            throw new AppError('A nota mínima não pode ser maior que a nota máxima.', 400);
        }

        const fornecedorNome = isAdmin && query.fornecedorNome ? query.fornecedorNome.trim() : undefined;
        const clienteNome = isAdmin && query.clienteNome ? query.clienteNome.trim() : undefined;

        const filters = {
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 10,
            startDate: query.startDate,
            endDate: query.endDate,
            notaMin,
            notaMax,
            search: query.search?.trim() || undefined,
            clienteId: isAdmin && query.clienteId ? Number(query.clienteId) : undefined,
            fornecedorId: isAdmin && query.fornecedorId ? Number(query.fornecedorId) : requester.id,
            fornecedorNome,
            clienteNome,
            isAdmin,
        };

        return this.avaliacaoRepository.listar(filters);
    }
}