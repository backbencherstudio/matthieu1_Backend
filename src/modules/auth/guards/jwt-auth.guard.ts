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

    // List of explicit public routes that don't require authentication
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/verify-email',
      '/api/auth/verify-otp',
      '/api/firebase-auth/google',
      '/api/contact-us',
      '/api/used-saddles/public',
      '/api/checkout/address',
      '/api/checkout/summary',
      '/api/sadlles/public',
      '/api/tackproduct/user',
    ];

    const isDynamicSadllesRoute =
      request.path.startsWith('/api/sadlles/public/') &&
      request.path !== '/api/sadlles';

     const isDynamicTackRoute = request.path.startsWith('/api/tackproduct/user') && request.path !== '/api/tackproduct';


    const isCartRoute = request.path.startsWith('/api/cart');

    // 🔥 FIX
    const isUsedSaddlePublic = request.path.startsWith(
      '/api/used-saddles/public',
    );

    if (
      publicRoutes.includes(request.path) ||
      isCartRoute ||
      isUsedSaddlePublic ||
      isDynamicSadllesRoute
      || isDynamicTackRoute
    ) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    //console.log(err, user, info);

    if (err || !user) {
      throw err || new UnauthorizedException('Token is expired or invalid');
    }
    return { ...user, isPrivate: user.isPrivate, type: user.type };
  }
}
