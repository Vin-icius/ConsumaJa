import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AvaliacaoService } from '../../application/services/avaliacao.service';
import { CreateAvaliacaoDto } from '../dtos/create-avaliacao.dto';
import { RelatorioAvaliacoesQueryDto } from '../dtos/relatorio-avaliacoes-query.dto';
import { AppError } from '../../common/errors/app-error';

export class AvaliacaoController {
    constructor(private avaliacaoService: AvaliacaoService) {
        this.criar = this.criar.bind(this);
        this.gerarRelatorio = this.gerarRelatorio.bind(this);
    }

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Tenta pegar o ID que o Frontend enviou no corpo
            let pessoaId = req.body.pessoa_id;

            // 2. Se não veio no corpo, tenta pegar do Token de Autenticação (fallback)
            if (!pessoaId && (req as any).user) {
                pessoaId = (req as any).user.id;
            }

            // 3. Se ainda assim não tiver ID, retorna erro
            if (!pessoaId) {
                return next(new AppError("ID do usuário não fornecido.", 400));
            }

            console.log(`[AvaliacaoController] Criando avaliação. Venda: ${req.body.venda_id}, Pessoa: ${pessoaId}`);

            // Prepara o DTO
            const dto = plainToClass(CreateAvaliacaoDto, req.body);
            
            // Validação do Class Validator
            const errors = await validate(dto);
            if (errors.length > 0) return next(errors);

            // Chama o serviço passando o DTO e o ID correto
            const avaliacao = await this.avaliacaoService.criar(dto, Number(pessoaId));
            
            res.status(201).json(avaliacao);
        } catch (error) {
            next(error);
        }
    }

    async gerarRelatorio(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(RelatorioAvaliacoesQueryDto, req.query);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        
        try {
            // Converte as strings de data para objetos Date antes de passar para o serviço
            const filtros = {
                ...dto,
                dataInicio: dto.dataInicio ? new Date(dto.dataInicio) : undefined,
                dataFim: dto.dataFim ? new Date(dto.dataFim) : undefined,
            };
            const relatorio = await this.avaliacaoService.gerarRelatorio(filtros);
            res.status(200).json(relatorio);
        } catch (error) {
            next(error);
        }
    }
}