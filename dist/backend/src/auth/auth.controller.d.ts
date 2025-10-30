import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(body: any): Promise<string>;
    login(body: {
        email: string;
        password: string;
    }): Promise<string>;
}
