import { Request, Response, NextFunction } from 'express';
import { CepService } from '../../application/services/cep.service';

export class CepController {
  constructor(private cepService: CepService) {}

  async lookupCep(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cep = req.params.cep;
      if (!cep) {
        res.status(400).json({ message: 'CEP não fornecido.' });
        return;
      }

      // Remover caracteres não numéricos para passar ao serviço
      const cleanedCep = cep.replace(/\D/g, '');
      if (cleanedCep.length !== 8) {
           res.status(400).json({ message: 'Formato de CEP inválido. Use 8 dígitos numéricos.' });
           return;
      }

      const addressInfo = await this.cepService.lookupAndPrepareAddress(cleanedCep);
      res.status(200).json(addressInfo);
    } catch (error) {
      next(error); // Passa para o error handler
    }
  }
}