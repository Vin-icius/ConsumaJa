import { CategoriaService } from '../../application/services/categoria.service';
import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCategoriaDto } from '../dtos/create-categoria.dto';
import { UpdateCategoriaDto } from '../dtos/update-categoria.dto';
import { AppError } from '../../common/errors/app-error';

export class CategoriaController {
  constructor(private categoriaService: CategoriaService) {
      // Binding explícito para garantir o 'this' correto
      this.criarCategoria = this.criarCategoria.bind(this);
      this.listarCategorias = this.listarCategorias.bind(this);
      this.buscarCategoriaPorId = this.buscarCategoriaPorId.bind(this);
      this.atualizarCategoria = this.atualizarCategoria.bind(this);
      this.excluirCategoria = this.excluirCategoria.bind(this);
  }

  async criarCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = plainToClass(CreateCategoriaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
        // Passa array de erros para middleware errorHandler formatar
        return next(errors);
    }

    try {
      const categoria = await this.categoriaService.criarCategoria(dto);
      res.status(201).json(categoria);
    } catch (error) {
      next(error);
    }
  }

  async listarCategorias(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const categorias = await this.categoriaService.listarCategorias();
       res.status(200).json(categorias);
     } catch (error) {
       next(error);
     }
  }

  async buscarCategoriaPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) {
             throw new AppError("ID inválido fornecido.", 400);
        }
        const categoria = await this.categoriaService.buscarCategoriaPorId(id);
        res.status(200).json(categoria);
     } catch (error) {
        next(error);
     }
  }

  async atualizarCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
     const id = parseInt(req.params.id, 10);
     if (isNaN(id) || id <= 0) {
        return next(new AppError("ID inválido fornecido.", 400));
     }

     const dto = plainToClass(UpdateCategoriaDto, req.body);
     const errors = await validate(dto);
     if (errors.length > 0) {
        return next(errors);
     }

     try {
        const categoria = await this.categoriaService.atualizarCategoria(id, dto);
        res.status(200).json(categoria);
     } catch (error) {
        next(error);
     }
  }

  async excluirCategoria(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = parseInt(req.params.id, 10);
         if (isNaN(id) || id <= 0) {
             throw new AppError("ID inválido fornecido.", 400);
         }
         await this.categoriaService.excluirCategoria(id);
         res.status(204).send();
      } catch (error) {
        next(error);
      }
  }
}