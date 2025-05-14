import { ProdutoService } from '../../application/services/produto.service';
import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProdutoDto } from '../dtos/create-produto.dto';
import { UpdateProdutoDto } from '../dtos/update-produto.dto';
import { RejeitarProdutoDto } from '../dtos/rejeitar-produto.dto';
import { ListarProdutosSelecaoQueryDto } from "../dtos/listar-produtos-selecao-query.dto"
import { AppError } from '../../common/errors/app-error';

export class ProdutoController {
   constructor(private produtoService: ProdutoService) {
      // Bind de todos os métodos que serão usados como handlers de rota
      this.criarProduto = this.criarProduto.bind(this);
      this.listarProdutos = this.listarProdutos.bind(this);
      this.buscarProdutoPorId = this.buscarProdutoPorId.bind(this);
      this.atualizarProduto = this.atualizarProduto.bind(this);
      this.excluirProduto = this.excluirProduto.bind(this);
      this.aprovarProduto = this.aprovarProduto.bind(this);
      this.rejeitarProduto = this.rejeitarProduto.bind(this);
      this.listarPendentes = this.listarPendentes.bind(this);
      this.listarParaSelecao = this.listarParaSelecao.bind(this);
  }

  async criarProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
    const dto = plainToClass(CreateProdutoDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) { return next(errors); }

    try {
      const produto = await this.produtoService.criarProduto(dto);
      res.status(201).json(produto);
    } catch (error) { next(error); }
  }

  async listarProdutos(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
       const filtros = req.query;
       const produtos = await this.produtoService.listarProdutos(filtros);
       res.status(200).json(produtos);
     } catch (error) { next(error); }
  }

  async listarParaSelecao(req: Request, res: Response, next: NextFunction): Promise<void> {
   console.log('[ProdutoController] GET /para-selecao-promocao - Query Params:', req.query); // Log Adicionado
   const dto = plainToClass(ListarProdutosSelecaoQueryDto, req.query);
   const errors = await validate(dto);
   if (errors.length > 0) {
       console.error('[ProdutoController] Erros de validação DTO listarParaSelecao:', errors);
       return next(errors);
   }
   try {
       // 'this' aqui deve referenciar a instância do ProdutoController
       // e this.produtoService deve estar definido.
       const produtos = await this.produtoService.listarParaSelecaoPromocao(dto);
       console.log('[ProdutoController] Produtos para seleção listados:', produtos.data.length);
       res.status(200).json(produtos);
   } catch (error) {
       console.error('[ProdutoController] Erro capturado em listarParaSelecao:', error);
       next(error);
   }
}

  async buscarProdutoPorId(req: Request, res: Response, next: NextFunction): Promise<void> {
     try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
        const produto = await this.produtoService.buscarProdutoPorId(id);
        res.status(200).json(produto);
     } catch (error) { next(error); }
  }

  async atualizarProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
     const id = parseInt(req.params.id, 10);
     if (isNaN(id) || id <= 0) { return next(new AppError("ID inválido.", 400)); }

     const dto = plainToClass(UpdateProdutoDto, req.body);
     const errors = await validate(dto);
     if (errors.length > 0) { return next(errors); }
     if (Object.keys(dto).length === 0) { return next(new AppError("Nenhum dado para atualizar.", 400)); }

     try {
        const produto = await this.produtoService.atualizarProduto(id, dto);
        res.status(200).json(produto);
     } catch (error) { next(error); }
  }

  async excluirProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const id = parseInt(req.params.id, 10);
         if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
         await this.produtoService.excluirProduto(id);
         res.status(204).send();
      } catch (error) { next(error); }
  }

  // --- Rotas de Aprovação ---

  async listarPendentes(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
         const produtos = await this.produtoService.listarProdutosPendentes();
         res.status(200).json(produtos);
       } catch (error) { next(error); }
  }

  async aprovarProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
       try {
         const id = parseInt(req.params.id, 10);
         if (isNaN(id) || id <= 0) { throw new AppError("ID inválido.", 400); }
         const produto = await this.produtoService.aprovarProduto(id);
         res.status(200).json(produto);
      } catch (error) { next(error); }
  }

   async rejeitarProduto(req: Request, res: Response, next: NextFunction): Promise<void> {
       const id = parseInt(req.params.id, 10);
       if (isNaN(id) || id <= 0) { return next(new AppError("ID inválido.", 400)); }

       const dto = plainToClass(RejeitarProdutoDto, req.body);
       const errors = await validate(dto);
       if (errors.length > 0) { return next(errors); }

       try {
         const produto = await this.produtoService.rejeitarProduto(id, dto);
         res.status(200).json(produto);
      } catch (error) { next(error); }
  }
}