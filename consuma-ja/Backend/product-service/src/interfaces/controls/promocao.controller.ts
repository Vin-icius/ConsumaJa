import { Request, Response, NextFunction } from 'express';
import { PromocaoService } from '../../application/services/promocao.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePromocaoDto } from '../dtos/create-promocao.dto';
import { UpdatePromocaoDto } from '../dtos/update-promocao.dto';
import { ListarPromocoesQueryDto } from '../dtos/listar-promocoes-query.dto';
import { AppError } from '../../common/errors/app-error';

export class PromocaoController {
  constructor(private promocaoService: PromocaoService) {
    // Bind methods
    this.criar = this.criar.bind(this);
    this.listar = this.listar.bind(this);
    this.buscarPorId = this.buscarPorId.bind(this);
    this.atualizar = this.atualizar.bind(this);
    this.excluir = this.excluir.bind(this);
  }

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = plainToClass(CreatePromocaoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) { return next(errors); }
    try {
      const promocao = await this.promocaoService.criarPromocao(dto);
      res.status(201).json(promocao);
    } catch (error) { next(error); }
  }

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('[PromocaoController] GET /promocoes - Query Params:', req.query); // Log da requisição
    const dto = plainToClass(ListarPromocoesQueryDto, req.query); // Valida query params
    const errors = await validate(dto);
    if (errors.length > 0) { return next(errors); }
    try {
      console.error('[PromocaoController] Erros de validação DTO:', errors);
      const promocoes = await this.promocaoService.listarPromocoesAtivas(dto);
      res.status(200).json(promocoes);
    } catch (error) {
      console.error('[PromocaoController] Erro capturado ao listar promoções:', error);
      next(error); }
  }

  async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido.", 400);
      const promocao = await this.promocaoService.getPromocaoDetalhes(id);
      res.status(200).json(promocao);
    } catch (error) { next(error); }
  }

  async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) return next(new AppError("ID inválido.", 400));
    const dto = plainToClass(UpdatePromocaoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) { return next(errors); }
    if (Object.keys(dto).length === 0) return next(new AppError("Nenhum dado para atualizar.", 400));
    try {
      const promocao = await this.promocaoService.atualizarPromocao(id, dto);
      res.status(200).json(promocao);
    } catch (error) { next(error); }
  }

  async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido.", 400);
      await this.promocaoService.excluirPromocao(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}