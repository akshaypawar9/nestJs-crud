import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService) { }

    async singup(dto: AuthDto) {
        try {
            const hash = await argon.hash(dto.password);

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                },
            })
            delete user.hash;
            return user;

        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    throw new ForbiddenException('Credentails taken',)
                }
            }
            throw err;
        }
    }

    async signin(dto: AuthDto) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email: dto.email }, });
            if (!user) {
                throw new ForbiddenException('Credentails incorrect');
            }
            // compare Password
            const pwdMatch = await argon.verify(user.hash, dto.password);
            if (!pwdMatch) {
                throw new ForbiddenException('Credentails incorrect');
            }
            return this.signToken(user.id, user.email);
        } catch (err) {
            throw err;
        }
    }

    async signToken(userId: number, email: string): Promise<{access_token: string}> {
        const secret = this.config.get('JWT_SECRET');
        const payload = {
            sub: userId,
            email,
        };
        const token = await this.jwt.signAsync(payload, { secret, expiresIn: '15m' });
        return { access_token : token };
    }
}