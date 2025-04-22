import { MarcaService } from '../../application/services/marca.service';
import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMarcaDto } from '../dtos/create-marca.dto';
import { UpdateMarcaDto } from '../dtos/update-marca.dto';
import { AppError } from '../../common/errors/app-error';

export class MarcaController {
  constructor(private marcaService: MarcaService) {
      this.criarMarca = this.criarMarca.bind(this);
      this.listarMarcas = this.listarMarcas.bind(this);
      this.buscarMarcaPorId = this.buscarMarcaPorId.bind(this);
      this.atualizarMarca = this.atualizarMarca.bind(this);
      this.excluirMarca = this.excluirMarca.bind(this);
  }

  async criarMarca(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = plainToClass(CreateMarcaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) { return next(errors); }
    try {
      const marca = await this.marcaService.criarMarca(dto);
      res.status(201).json(marca);
    } catch (error) { next(error); }
  }

  async listarMarcas(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const marcas = await this.marcaService.listarMarcas();
       res.status(200).json(marcas);
     } catch (error) { next(error); }
  }

  async buscarMarcaPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
        const marca = await this.marcaService.buscarMarcaPorId(id);
        res.status(200).json(marca);
     } catch (error) { next(error); }
  }

  async atualizarMarca(req: Request, res: Response, next: NextFunction): Promise<void> {
     const id = parseInt(req.params.id, 10);
     if (isNaN(id) || id <= 0) { return next(new AppError("ID inválido.", 400)); }
     const dto = plainToClass(UpdateMarcaDto, req.body);
     const errors = await validate(dto);
     if (errors.length > 0) { return next(errors); }
     if (Object.keys(dto).length === 0) { return next(new AppError("Nenhum dado para atualizar.", 400)); }
     try {
        const marca = await this.marcaService.atualizarMarca(id, dto);
        res.status(200).json(marca);
     } catch (error) { next(error); }
  }

  async excluirMarca(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = parseInt(req.params.id, 10);
         if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
         await this.marcaService.excluirMarca(id);
         res.status(204).send();
      } catch (error) { next(error); }
  }
}