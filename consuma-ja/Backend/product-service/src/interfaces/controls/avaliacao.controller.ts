import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AppError } from '../../common/errors/app-error';
import { AvaliacaoService } from '../../application/services/avaliacao.service';
import { CreateAvaliacaoDto } from '../dtos/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from '../dtos/update-avaliacao.dto';
import { ListarAvaliacoesQueryDto } from '../dtos/listar-avaliacoes-query.dto';

export class AvaliacaoController {
    constructor(private avaliacaoService: AvaliacaoService) {
        this.criar = this.criar.bind(this);
        this.listarPorProduto = this.listarPorProduto.bind(this);
        this.atualizar = this.atualizar.bind(this);
        this.excluir = this.excluir.bind(this);
    }

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        // Em uma aplicação real, o ID do usuário viria de um middleware de autenticação.
        // Ex: const pessoa_id = (req as any).user.id;
        const pessoa_id = 1; // << USAR VALOR MOCKADO POR ENQUANTO
        if (!pessoa_id) {
            return next(new AppError("Usuário não autenticado.", 401));
        }
        
        const dto = plainToClass(CreateAvaliacaoDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        
        try {
            const avaliacao = await this.avaliacaoService.criar(dto, pessoa_id);
            res.status(201).json(avaliacao);
        } catch (error) {
            next(error);
        }
    }
    
    async listarPorProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
        const produtoId = parseInt(req.params.produtoId, 10);
        if (isNaN(produtoId)) {
            return next(new AppError("ID do produto inválido.", 400));
        }

        const dto = plainToClass(ListarAvaliacoesQueryDto, req.query);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);

        try {
            const resultado = await this.avaliacaoService.listarPorProduto(produtoId, dto);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const avaliacao_id = parseInt(req.params.id, 10);
        if (isNaN(avaliacao_id)) return next(new AppError("ID da avaliação inválido.", 400));
        
        // const pessoa_id = (req as any).user.id; // << VIRIA DO MIDDLEWARE DE AUTH
        const pessoa_id = 1; // << MOCKADO
        if (!pessoa_id) return next(new AppError("Usuário não autenticado.", 401));

        const dto = plainToClass(UpdateAvaliacaoDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        if (Object.keys(dto).length === 0) return next(new AppError("Nenhum dado para atualizar.", 400));

        try {
            const avaliacao = await this.avaliacaoService.atualizar(avaliacao_id, dto, pessoa_id);
            res.status(200).json(avaliacao);
        } catch (error) {
            next(error);
        }
    }

    async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
        const avaliacao_id = parseInt(req.params.id, 10);
        if (isNaN(avaliacao_id)) return next(new AppError("ID da avaliação inválido.", 400));
        
        // const pessoa_id = (req as any).user.id; // << VIRIA DO MIDDLEWARE DE AUTH
        const pessoa_id = 1; // << MOCKADO
        if (!pessoa_id) return next(new AppError("Usuário não autenticado.", 401));

        try {
            await this.avaliacaoService.excluir(avaliacao_id, pessoa_id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}