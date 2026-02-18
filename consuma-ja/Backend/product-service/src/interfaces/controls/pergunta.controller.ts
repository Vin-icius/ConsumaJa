import { Request, Response, NextFunction } from 'express';
import { PerguntaService } from '../../application/services/pergunta.service';

export class PerguntaController {
    constructor(private perguntaService: PerguntaService) {
        this.listarAtivas = this.listarAtivas.bind(this);
    }

    async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const perguntas = await this.perguntaService.listarAtivas();
            res.status(200).json(perguntas);
        } catch (error) {
            next(error);
        }
    }
    
}