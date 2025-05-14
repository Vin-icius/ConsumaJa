import { Request, Response, NextFunction } from 'express';
import { EnderecoService } from '../../application/services/endereco.service';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateEnderecoDto } from '../dtos/create-endereco-dto';
import { UpdateEnderecoDto } from '../dtos/update-endereco.dto';
import { ListarEnderecosQueryDto } from '../dtos/listar-enderecos-query.dto';
import { AppError } from '../../common/errors/app-error';

export class EnderecoController {
    constructor(private enderecoService: EnderecoService) {
        this.criar = this.criar.bind(this);
        this.listar = this.listar.bind(this);
        this.buscarPorId = this.buscarPorId.bind(this);
        this.atualizar = this.atualizar.bind(this);
        this.excluir = this.excluir.bind(this);
    }

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(CreateEnderecoDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        try {
            const endereco = await this.enderecoService.criarEndereco(dto);
            res.status(201).json(endereco);
        } catch (error) { next(error); }
    }


    async listar(req: Request, res: Response, next: NextFunction): Promise<void> { // <<< Nome correto
        console.log('[EnderecoController] Listar Endereços - Query Params Recebidos:', req.query); // Log dos query params
        const dto = plainToClass(ListarEnderecosQueryDto, req.query);
        const errors = await validate(dto);
        if (errors.length > 0) {
            console.error('[EnderecoController] Erros de validação DTO ListarEnderecos:', errors);
            return next(errors);
        }
        try {
            // O serviço de endereço agora recebe o DTO de filtros validado
            const paginatedResponse = await this.enderecoService.listar(dto);
            // O frontend PromocaoForm espera um array direto, então enviamos paginatedResponse.data
            res.status(200).json(paginatedResponse.data);
        } catch (error) {
            next(error);
        }
    }

    async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
        const idParam = req.params.id; // Pega o que veio como :id
        console.log(`[EnderecoController] Buscar Endereço por ID - Parâmetro recebido como ID: '${idParam}'`); // Log do ID

        try {
            const id = parseInt(idParam, 10);
            if (isNaN(id) || id <= 0) {
                // Este é o erro que você está vendo no log
                throw new AppError("ID do endereço inválido.", 400);
            }
            const endereco = await this.enderecoService.buscarEnderecoPorId(id);
            res.status(200).json(endereco);
        } catch (error) {
            next(error);
        }
    }

    async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return next(new AppError("ID do endereço inválido.", 400));
        const dto = plainToClass(UpdateEnderecoDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) return next(errors);
        if (Object.keys(dto).length === 0) return next(new AppError("Nenhum dado para atualizar.", 400));
        try {
            const endereco = await this.enderecoService.atualizarEndereco(id, dto);
            res.status(200).json(endereco);
        } catch (error) { next(error); }
    }

    async excluir(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) throw new AppError("ID do endereço inválido.", 400);
            await this.enderecoService.excluirEndereco(id);
            res.status(204).send();
        } catch (error) { next(error); }
    }
}