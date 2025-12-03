import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { TipoService } from '../../application/services/tipo.service';
import { CreateTipoDto } from '../dtos/create-tipo.dto';
import { UpdateTipoDto } from '../dtos/update-tipo.dto';
import { AppError } from '../../common/errors/app-error';

export class TipoController {
  constructor(private tipoService: TipoService) {
      // Binding
      this.criarTipo = this.criarTipo.bind(this);
      this.listarTipos = this.listarTipos.bind(this);
      this.buscarTipoPorId = this.buscarTipoPorId.bind(this);
      this.atualizarTipo = this.atualizarTipo.bind(this);
      this.excluirTipo = this.excluirTipo.bind(this);
  }

   async criarTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const fornecedorId = this.resolveFornecedorId(req);
         const dto = plainToClass(CreateTipoDto, {
               ...req.body,
               fornecedor_pessoa_id: fornecedorId,
         });
         const errors = await validate(dto);
         if (errors.length > 0) { return next(errors); }
         const tipo = await this.tipoService.criarTipo(dto);
         res.status(201).json(tipo);
      } catch (error) { next(error); }
   }

  async listarTipos(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const tipos = await this.tipoService.listarTipos();
       res.status(200).json(tipos);
     } catch (error) { next(error); }
  }

  async buscarTipoPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
        const tipo = await this.tipoService.buscarTipoPorId(id);
        res.status(200).json(tipo);
     } catch (error) { next(error); }
  }

  async atualizarTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
     const id = parseInt(req.params.id, 10);
     if (isNaN(id) || id <= 0) { return next(new AppError("ID inválido.", 400)); }

     const dto = plainToClass(UpdateTipoDto, req.body);
     const errors = await validate(dto);
     if (errors.length > 0) { return next(errors); }
     if (Object.keys(dto).length === 0) { return next(new AppError("Nenhum dado para atualizar.", 400)); }

     try {
        const tipo = await this.tipoService.atualizarTipo(id, dto);
        res.status(200).json(tipo);
     } catch (error) {
        next(error);
     }
  }

  async excluirTipo(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = parseInt(req.params.id, 10);
         if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
         await this.tipoService.excluirTipo(id);
         res.status(204).send();
      } catch (error) { next(error); }
  }

  private resolveFornecedorId(req: Request): number | null {
     if (!req.user) {
        throw new AppError('Usuário não autenticado.', 401);
     }

     if (req.user.tipo === 'Juridica') {
        return req.user.id;
     }

     if (req.user.tipo === 'Admin') {
        const raw = req.body?.fornecedor_pessoa_id ?? req.body?.fornecedorId ?? null;
        if (raw === null || raw === undefined || raw === '') {
           return null;
        }

        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
           throw new AppError('Fornecedor informado é inválido.', 400);
        }
        return parsed;
     }

     throw new AppError('Apenas administradores ou fornecedores podem gerenciar tipos.', 403);
  }
}