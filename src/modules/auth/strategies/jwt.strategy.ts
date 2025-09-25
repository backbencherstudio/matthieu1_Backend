import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import appConfig from '../../../config/app.config';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // ignoreExpiration: true, // Set to true or false based on your need
      ignoreExpiration: false, // Ensure that expired tokens are rejected

      secretOrKey: appConfig().jwt.secret,
    });
  }

  async validate(payload: any) {
    // Fetch user from the database based on the userId from the JWT payload
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }, // Use 'sub' for userId in the JWT payload
      select: { id: true, email: true, type: true }, // Make sure 'type' is selected
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Return the user object with 'userId', 'email', and 'type' fields
    return { userId: user.id, email: user.email, type: user.type };
  }
}
