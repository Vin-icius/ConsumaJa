import { Request, Response, NextFunction } from 'express';
import { PerguntaService } from '../../application/services/pergunta.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePerguntaDto } from '../dtos/create-pergunta.dto';
import { UpdatePerguntaDto } from '../dtos/update-pergunta.dto';

export class PerguntaController {
    constructor(private perguntaService: PerguntaService) {
        this.listarAtivas = this.listarAtivas.bind(this);
        this.listarTodas = this.listarTodas.bind(this);
        this.criar = this.criar.bind(this);
        this.atualizar = this.atualizar.bind(this);
        this.excluirLogico = this.excluirLogico.bind(this);
        this.excluirFisico = this.excluirFisico.bind(this);
    }

    async listarAtivas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const perguntas = await this.perguntaService.listarAtivas();
            res.status(200).json(perguntas);
        } catch (error) {
            next(error);
        }
    }

    async listarTodas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const perguntas = await this.perguntaService.listarTodas();
            res.status(200).json(perguntas);
        } catch (error) { next(error); }
    }

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(CreatePerguntaDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        
        try {
            const novaPergunta = await this.perguntaService.criar(dto);
            res.status(201).json(novaPergunta);
        } catch (error) { next(error); }
    }

    async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id = parseInt(req.params.id, 10);
        const dto = plainToClass(UpdatePerguntaDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        if (Object.keys(dto).length === 0) {
            return next({ message: "Nenhum dado fornecido para atualização.", status: 400 });
        }
        
        try {
            const perguntaAtualizada = await this.perguntaService.atualizar(id, dto);
            res.status(200).json(perguntaAtualizada);
        } catch (error) { next(error); }
    }

    async excluirLogico(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) return next({ message: "ID da pergunta inválido.", status: 400 });
            
            await this.perguntaService.excluirLogico(id);
            res.status(204).send(); // Sucesso, sem conteúdo
        } catch (error) {
            next(error);
        }
    }

    async excluirFisico(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log("Chegou na controller de exclusão física");
        try {
            const id = parseInt(req.params.id, 10);
            await this.perguntaService.excluirFisico(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}