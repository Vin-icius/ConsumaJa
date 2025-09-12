import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AvaliacaoService } from '../../application/services/avaliacao.service';
import { CreateAvaliacaoDto } from '../dtos/create-avaliacao.dto';
import { AppError } from '../../common/errors/app-error';

export class AvaliacaoController {
    constructor(private avaliacaoService: AvaliacaoService) {
        this.criar = this.criar.bind(this);
    }

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const pessoaId = 1; // Substituir pelo ID do usuário autenticado (req.user.id)
        if (!pessoaId) return next(new AppError("Usuário não autenticado.", 401));

        const dto = plainToClass(CreateAvaliacaoDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);

        try {
            const avaliacao = await this.avaliacaoService.criar(dto, pessoaId);
            res.status(201).json(avaliacao);
        } catch (error) {
            next(error);
        }
    }
}