// src/interfaces/controls/cidade.controller.ts
import { Request, Response, NextFunction } from 'express';
import { CidadeService } from '../../application/services/cidade.service';
import { Cidade } from '../../domain/entities/cidade.entity';
import { CreateCidadeDto } from '../dtos/cidade-create.dto';
import { UpdateCidadeDto } from '../dtos/cidade-update.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AppError } from '../../common/errors/app-error';

export class CidadeController {
  constructor(private cidadeService: CidadeService) {
    // Binding explícito dos métodos para garantir o 'this' correto
    this.create = this.create.bind(this);
    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.getByEstadoId = this.getByEstadoId.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createDto = plainToClass(CreateCidadeDto, req.body);
      const errors = await validate(createDto);
      if (errors.length > 0) {
         return next(errors); // Passa erros de validação para errorHandler
      }
      const novaCidade = await this.cidadeService.createCidade(createDto);
      res.status(201).json(novaCidade);
    } catch (error) {
      next(error);
    }
  }


  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const { nome, estadoSigla, ddd } = req.query;
        const params = {
            nome: nome as string | undefined,
            estadoSigla: estadoSigla as string | undefined,
            ddd: ddd as string | undefined,
        };
        const cidades = await this.cidadeService.getAllCidades(params);
        res.status(200).json(cidades); // Retornará [] se não houver cidades
      } catch (error) {
        next(error);
      }
  }


  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('ID da cidade inválido.', 400);
      }
      const cidade = await this.cidadeService.getCidadeById(id);
      res.status(200).json(cidade);
    } catch (error) { next(error); }
  }

  async getByEstadoId(req: Request, res: Response, next: NextFunction): Promise<void> {
       try {
        const estadoId = parseInt(req.params.estadoId, 10);
         if (isNaN(estadoId)) {
           throw new AppError('ID do estado inválido.', 400);
         }
        const cidades = await this.cidadeService.getCidadesByEstado(estadoId);
        res.status(200).json(cidades);
       } catch (error) {
        next(error);
       }
   }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
       if (isNaN(id)) {
         throw new AppError('ID da cidade inválido.', 400);
       }

      const updateDto = plainToClass(UpdateCidadeDto, req.body);
       const errors = await validate(updateDto);
       if (errors.length > 0) {
          return next(errors);
       }
       if (Object.keys(updateDto).length === 0) {
           throw new AppError('Nenhum dado fornecido para atualização.', 400);
       }

      const cidadeAtualizada = await this.cidadeService.updateCidade(id, updateDto);
      res.status(200).json(cidadeAtualizada);
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
       if (isNaN(id)) {
         throw new AppError('ID da cidade inválido.', 400);
       }
      await this.cidadeService.deleteCidade(id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}