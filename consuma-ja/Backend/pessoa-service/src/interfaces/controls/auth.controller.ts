import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { SessaoDto } from '../dtos/sessao.dto';
import { TwoFactorVerifyDto } from '../dtos/twofactor-verify.dto';

export class AuthController {
    constructor(private authService: AuthService) {
        this.login = this.login.bind(this);
        this.validarSessao = this.validarSessao.bind(this);
        this.encerrarSessao = this.encerrarSessao.bind(this);
        this.verifyTwoFactor = this.verifyTwoFactor.bind(this);
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(LoginDto, req.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return next(errors);
        }

        try {
            const authResponse = await this.authService.login(dto);
            res.status(200).json(authResponse); // Retorna token e dados do usuário
        } catch (error) {
            next(error);
        }
    }

    async validarSessao(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(SessaoDto, req.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return next(errors);
        }

        try {
            const resultado = await this.authService.validarSessao(dto.sessao_id);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async encerrarSessao(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(SessaoDto, req.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return next(errors);
        }

        try {
            await this.authService.encerrarSessao(dto.sessao_id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async verifyTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(TwoFactorVerifyDto, req.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return next(errors);
        }

        try {
            const resultado = await this.authService.verificarCodigo2FA(dto.token, dto.codigo_2fa);
            res.status(200).json(resultado);
        } catch (error) {
            next(error);
        }
    }
}