import { Body, Controller, Post, HttpCode, HttpStatus, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { FirebaseGoogleAuthService } from './firebase-googleauth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';

@ApiTags('Firebase Google Auth')
@Controller('firebase-auth')
export class FirebaseGoogleAuthController {
  private readonly logger = new Logger(FirebaseGoogleAuthController.name);

  constructor(private readonly firebaseAuthService: FirebaseGoogleAuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login/Register with Google (Firebase ID Token or Direct Info)' })
  @ApiBody({ type: GoogleAuthDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully authenticated with Google' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request data' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid Firebase token or missing required fields' })
  @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Server error' })
  async googleAuth(@Body() dto: GoogleAuthDto) {
    this.logger.log('Received Google authentication request');
    try {
      // Check if we have either idToken or email
      if (!dto.idToken && !dto.email) {
        this.logger.warn('Missing both idToken and email in request');
        throw new BadRequestException('Either idToken or email is required');
      }
      
      // Pass the fields from Flutter app to the service
      const result = await this.firebaseAuthService.googleLogin(
        dto.idToken,
        dto.name,
        dto.email,
        dto.profilePicUrl
      );
      return result;
    } catch (error) {
      this.logger.error(`Google authentication failed: ${error.message}`, error.stack);
      throw error; // Let NestJS exception filters handle the error
    }
  }
}
