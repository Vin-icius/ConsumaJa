import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { Login2FADto } from '../dtos/login-2fa.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export class AuthController {
    constructor(private authService: AuthService) {
        this.login = this.login.bind(this);
        this.loginWith2FA = this.loginWith2FA.bind(this);
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

    async loginWith2FA(req: Request, res: Response, next: NextFunction): Promise<void> {
        const dto = plainToClass(Login2FADto, req.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            return next(errors);
        }

        try {
            const authResponse = await this.authService.loginWith2FA(dto);
            res.status(200).json(authResponse); // Retorna token e dados do usuário
        } catch (error) {
            next(error);
        }
    }
}