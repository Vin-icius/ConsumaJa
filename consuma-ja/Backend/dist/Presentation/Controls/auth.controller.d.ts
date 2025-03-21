import { AuthService } from '../../Application/Services/auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        login: string;
        senha: string;
    }): Promise<{
        access_token: string;
        tipo: string;
    }>;
}
