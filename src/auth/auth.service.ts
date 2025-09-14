import { Injectable, UnauthorizedException } from '@nestjs/common';
import { google } from 'googleapis';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateGoogleToken(
    idToken: string,
  ): Promise<{ email: string; name: string; picture: string }> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }
      return {
        email: payload.email as string,
        name: payload.name as string,
        picture: payload.picture as string,
      };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async googleLogin(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);

    let user = await this.usersService.findByEmail(userData.email);
    if (!user) {
      user = await this.usersService.create(userData);
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
