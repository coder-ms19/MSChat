import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/** Default password assigned to all OAuth users so they can also log in with email+password */
const OAUTH_DEFAULT_PASSWORD = 'temp';

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private prismaService: PrismaService,
  ) {}

  async signup(dto: SignUpDto) {
    dto.password = await bcrypt.hash(dto.password, 10);

    const id = crypto.randomUUID();
    const [user] = await this.prismaService.$queryRaw<any[]>`
      INSERT INTO "User" (id, username, password, email, "updatedAt") 
      VALUES (${id}, ${dto.username}, ${dto.password}, ${dto.email}, NOW()) 
      RETURNING *`;

    return user;
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const data = await this.prismaService.$queryRaw<any[]>`
      SELECT * FROM "User" WHERE email = ${dto.email}`;

    const user = data[0];

    if (!user) {
      throw new NotFoundException('User not found'); // 404
    }

    // 2. Guard: password should never be null now (OAuth users have "temp" hash)
    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials'); // 401
    }

    // 4. Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      user.role || 'USER',
    );

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      tokens,
    };
  }

  async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role: role as any };

    const accessToken = this.jwt.sign(payload, {
      expiresIn: '30d',
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '50d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { accessToken, refreshToken };
  }

  async validateOAuthUser(profile: any) {
    const { email, username, avatarUrl, provider, providerId } = profile;

    // Pre-hash the default password once (used if needed)
    const tempPasswordHash = await bcrypt.hash(OAUTH_DEFAULT_PASSWORD, 10);

    // Check if user exists by email
    let user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      // ── New OAuth user ─────────────────────────────────────────────
      // Generate a unique username if the desired one is taken
      let finalUsername = username;
      let counter = 1;
      while (
        await this.prismaService.user.findUnique({
          where: { username: finalUsername },
        })
      ) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      user = await this.prismaService.user.create({
        data: {
          email,
          username: finalUsername,
          avatarUrl,
          provider,
          providerId,
          password: tempPasswordHash, // ← default "temp" password (hashed)
        },
      });
    } else {
      // ── Existing OAuth user ────────────────────────────────────────
      // Refresh avatar/provider info and backfill password if it was null
      const needsUpdate =
        user.avatarUrl !== avatarUrl ||
        user.provider !== provider ||
        !user.password; // backfill "temp" for users created before this change

      if (needsUpdate) {
        user = await this.prismaService.user.update({
          where: { id: user.id },
          data: {
            avatarUrl,
            provider,
            providerId,
            // Only set password if it is currently null
            ...(!user.password ? { password: tempPasswordHash } : {}),
          },
        });
      }
    }

    // Generate JWT tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      tokens,
    };
  }
}