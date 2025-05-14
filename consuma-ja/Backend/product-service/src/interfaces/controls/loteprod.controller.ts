import { Request, Response, NextFunction } from 'express';
import { LoteProdService } from '../../application/services/loteprod.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateLoteProdDto } from '../dtos/create-loteprod.dto';
import { UpdateLoteProdDto } from '../dtos/update-loteprod.dto';
import { ListarLotesQueryDto } from '../dtos/listar-lotes-query.dto';
import { ListarLotesDisponiveisQueryDto } from '../dtos/listar-lotesdisponiveis-query.dto';
import { AppError } from '../../common/errors/app-error';

export class LoteProdController {
    constructor(private loteProdService: LoteProdService) {
        this.criar = this.criar.bind(this);
        this.listar = this.listar.bind(this);
        this.buscarPorId = this.buscarPorId.bind(this);
        this.atualizar = this.atualizar.bind(this);
        this.excluir = this.excluir.bind(this);
        this.listarDisponiveisParaSelecao = this.listarDisponiveisParaSelecao.bind(this);
    }

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(CreateLoteProdDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        try {
            const lote = await this.loteProdService.criarLote(dto);
            res.status(201).json(lote);
        } catch (error) { next(error); }
    }

    async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(ListarLotesQueryDto, req.query);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        try {
            const paginatedResponse = await this.loteProdService.listarLotes(dto);
            res.status(200).json(paginatedResponse);
        } catch (error) { next(error); }
    }

    async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) throw new AppError("ID do lote inválido.", 400);
            const lote = await this.loteProdService.buscarLotePorId(id);
            res.status(200).json(lote);
        } catch (error) { next(error); }
    }

    async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return next(new AppError("ID do lote inválido.", 400));
        const dto = plainToClass(UpdateLoteProdDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        if (Object.keys(dto).length === 0) return next(new AppError("Nenhum dado para atualizar.", 400));
        try {
            const lote = await this.loteProdService.atualizarLote(id, dto);
            res.status(200).json(lote);
        } catch (error) { next(error); }
    }

    async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) throw new AppError("ID do lote inválido.", 400);
            await this.loteProdService.excluirLote(id);
            res.status(204).send();
        } catch (error) { next(error); }
    }

    async listarDisponiveisParaSelecao(req: Request, res: Response, next: NextFunction): Promise<void> {
        // Validar os query params usando o DTO
        const dto = plainToClass(ListarLotesDisponiveisQueryDto, req.query);
        const errors = await validate(dto);
        if (errors.length > 0) {
            return next(errors); // Deixa o errorHandler formatar
        }

        try {
            const lotes = await this.loteProdService.listarDisponiveisParaPromocao(dto);
            res.status(200).json(lotes);
        } catch (error) {
            next(error);
        }
    }
}