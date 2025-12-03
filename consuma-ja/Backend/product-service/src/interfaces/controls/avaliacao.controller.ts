import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AvaliacaoService } from '../../application/services/avaliacao.service';
import { CreateAvaliacaoDto } from '../dtos/create-avaliacao.dto';
import { AppError } from '../../common/errors/app-error';
import { ListarAvaliacoesQueryDto } from '../dtos/listar-avaliacoes-query.dto';

export class AvaliacaoController {
    constructor(private avaliacaoService: AvaliacaoService) {
        this.criar = this.criar.bind(this);
        this.listar = this.listar.bind(this);
    }

    async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userData = (req as any)?.user;
        if (!userData) {
            return next(new AppError('Usuário não autenticado.', 401));
        }

        const queryDto = plainToClass(ListarAvaliacoesQueryDto, req.query, { enableImplicitConversion: true });
        const errors = await validate(queryDto);
        if (errors.length > 0) {
            return next(errors);
        }

        try {
            const result = await this.avaliacaoService.listar(queryDto, userData);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userData = (req as any)?.user;
        const pessoaIdRaw = userData?.id ?? req.body?.pessoa_id ?? req.body?.cliente_id;
        const pessoaId = pessoaIdRaw ? Number(pessoaIdRaw) : null;
        if (!pessoaId || Number.isNaN(pessoaId)) {
            return next(new AppError("Usuário não autenticado.", 401));
        }

        const dto = plainToClass(CreateAvaliacaoDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);

        if (!Array.isArray(dto.respostas) || dto.respostas.length === 0) {
            return next(new AppError('Informe ao menos uma resposta para a avaliação.', 400));
        }

        try {
            const avaliacao = await this.avaliacaoService.criar(dto, pessoaId);
            res.status(201).json(avaliacao);
        } catch (error) {
            next(error);
        }
    }
}