import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }
  canActivate(context: ExecutionContext) {
    // Get the request
    const request = context.switchToHttp().getRequest();

    // List of public routes that don't need authentication
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/api/firebase-auth/google',
      
    ];

    // Check if the route is public
    if (publicRoutes.includes(request.path)) {
      console.log("public route")
      return true;
    }

    // For protected routes, check the JWT
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {

    // You can throw an exception based on either "info" or "err" arguments
    //console.log(err, user, info);

    if (err || !user) {
      throw err || new UnauthorizedException("Token is expired or invalid");
    }
    return { ...user, isPrivate: user.isPrivate, type: user.type };
  }
}
