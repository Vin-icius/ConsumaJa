// src/interfaces/controls/pessoa.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PessoaService } from '../../application/services/pessoa.service'; // Mude para PessoaService
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateFisicaDto } from '../dtos/create-fisica.dto';
import { CreateJuridicaDto } from '../dtos/create-juridica.dto';
import { UpdatePessoaDto } from '../dtos/update-pessoa.dto';
import { AppError } from '../../common/errors/app-error';
import path from 'path';
import fs from 'fs'; // Para deletar arquivo em caso de erro no DB

export class PessoaController {
    constructor(private pessoaService: PessoaService) { // <<< Usa PessoaService
         this.registrar = this.registrar.bind(this);
         this.uploadFoto = this.uploadFoto.bind(this);
         this.buscarPorId = this.buscarPorId.bind(this);
         this.listarPessoas = this.listarPessoas.bind(this);    
         this.atualizarPessoa = this.atualizarPessoa.bind(this);
         this.excluirPessoa = this.excluirPessoa.bind(this);  
    }

    async registrar(req: Request, res: Response, next: NextFunction): Promise<void> {
        const tipo = req.body?.pessoa_tipo;
        let dto: CreateFisicaDto | CreateJuridicaDto; // Tipo união
        let errors;

        // Usa o tipo para determinar qual DTO validar
        if (tipo === 'Fisica') { dto = plainToClass(CreateFisicaDto, req.body); errors = await validate(dto); }
        else if (tipo === 'Juridica') { dto = plainToClass(CreateJuridicaDto, req.body); errors = await validate(dto); }
        else { return next(new AppError("Tipo de pessoa inválido ou não fornecido.", 400)); }

        if (errors && errors.length > 0) { return next(errors); }

        try {
            const novaPessoa = await this.pessoaService.registrarPessoa(dto);
            // Retorna a pessoa criada (importante ter o ID para os uploads subsequentes)
            res.status(201).json(novaPessoa);
        } catch (error) { next(error); }
    }

    async uploadFoto(req: Request, res: Response, next: NextFunction): Promise<void> {
         const pessoaId = parseInt(req.params.id, 10);
         const tipoFoto = req.params.tipoFoto as ('selfie' | 'documento');

         if (isNaN(pessoaId) || !['selfie', 'documento'].includes(tipoFoto)) {
              // Se o arquivo já foi salvo pelo multer, deleta ele pois a requisição é inválida
              if(req.file?.path) fs.unlink(req.file.path, (err) => { if(err) console.error("Erro ao deletar arquivo órfão:", err);});
              return next(new AppError('ID do usuário ou tipo de foto inválido na URL.', 400));
         }
         if (!req.file) { return next(new AppError('Nenhum arquivo de foto recebido.', 400)); }

         // Caminho relativo para salvar no DB (ajuste se multer salvar diferente)
         const relativePath = `fotosUsuarios/${req.file.filename}`;

         try {
             const success = await this.pessoaService.salvarCaminhoFoto(pessoaId, tipoFoto, relativePath);
             if (!success) {
                  // Se falhou ao salvar no DB, deleta o arquivo físico
                  if(req.file?.path) fs.unlink(req.file.path, (err) => { if(err) console.error("Erro ao deletar arquivo após falha no DB:", err);});
                  // Tenta buscar a pessoa para dar erro mais específico
                  const pessoa = await this.pessoaService.buscarPessoaPorId(pessoaId); // Pode dar 404
                  if (pessoa.pessoa_tipo !== 'Fisica') throw new AppError(`Usuário ${pessoaId} não é Pessoa Física.`, 400);
                  throw new AppError(`Não foi possível associar a foto ${tipoFoto} ao usuário ${pessoaId}.`, 500);
             }
             res.status(200).json({ message: `Foto ${tipoFoto} enviada com sucesso!`, path: relativePath });
         } catch (error) {
             // Garante que o arquivo físico seja deletado se o serviço lançar erro
             if(req.file?.path) fs.unlink(req.file.path, (err) => { if(err) console.error("Erro ao deletar arquivo após erro no serviço:", err);});
             next(error);
         }
    }

    // Implementar outros handlers CRUD (buscarPorId, atualizar, excluir, listar) chamando PessoaService
    async buscarPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
           const id = parseInt(req.params.id, 10);
           if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
           const pessoa = await this.pessoaService.buscarPessoaPorId(id);
           res.status(200).json(pessoa);
        } catch (error) { next(error); }
   }
    
     async listarPessoas(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // TODO: Adicionar lógica para filtros de query string (req.query) se necessário
            const apenasAtivos = req.query.ativos !== 'false'; // Exemplo: /pessoas?ativos=false
            const pessoas = await this.pessoaService.listarPessoas(apenasAtivos);
            res.status(200).json(pessoas);
        } catch (error) {
            next(error);
        }
    }

    // <<< NOVO/ATUALIZADO: Atualizar Pessoa >>>
    async atualizarPessoa(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) { return next(new AppError("ID inválido.", 400)); }

        const dto = plainToClass(UpdatePessoaDto, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) { return next(errors); }
        // Não precisa checar DTO vazio, pois Partial é permitido
        // if (Object.keys(dto).length === 0) { return next(new AppError("Nenhum dado para atualizar.", 400)); }

        try {
           const pessoa = await this.pessoaService.atualizarPessoa(id, dto);
           // Serviço lança 404 se não achar
           res.status(200).json(pessoa);
        } catch (error) {
           next(error);
        }
   }

    // <<< NOVO/ATUALIZADO: Excluir (Desativar) Pessoa >>>
    async excluirPessoa(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
           const id = parseInt(req.params.id, 10);
           if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
           await this.pessoaService.excluirPessoa(id);
           // Serviço lança 404 se não encontrar ativo
           res.status(204).send(); // Sucesso sem conteúdo
        } catch (error) {
          next(error);
        }
    }

}