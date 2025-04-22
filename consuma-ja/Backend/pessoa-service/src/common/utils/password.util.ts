import * as bcrypt from 'bcrypt';

const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;

export class PasswordUtil {
    static async hashPassword(plainPassword: string): Promise<string> {
        return bcrypt.hash(plainPassword, saltRounds);
    }

    static async comparePassword(plainPassword: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hash);
    }
}