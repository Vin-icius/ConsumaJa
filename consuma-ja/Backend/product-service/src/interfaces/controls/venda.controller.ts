import { Request, Response, NextFunction } from 'express';
import { VendaService } from '../../application/services/venda.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateVendaDto } from '../dtos/create-venda.dto';
import { AppError } from '../../common/errors/app-error';

export class VendaController {
  constructor(private vendaService: VendaService) {
    this.criar = this.criar.bind(this);
  }

  async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = plainToClass(CreateVendaDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      console.error('[VendaController] Erros de validação:', errors);
      return next(errors);
    }

    try {
      const venda = await this.vendaService.criarVenda(dto);
      res.status(201).json(venda);
    } catch (error) {
      next(error);
    }
  }
}