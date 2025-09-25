import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { FirebaseGoogleAuthController } from './firebase-googleauth.controller';
import { FirebaseGoogleAuthService } from './firebase-googleauth.service';
import { GoogleAuthDto } from './dto/google-auth.dto';

describe('FirebaseGoogleAuthController', () => {
  let controller: FirebaseGoogleAuthController;
  let service: FirebaseGoogleAuthService;

  const mockFirebaseGoogleAuthService = {
    googleLogin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FirebaseGoogleAuthController],
      providers: [
        {
          provide: FirebaseGoogleAuthService,
          useValue: mockFirebaseGoogleAuthService,
        },
      ],
    }).compile();

    controller = module.get<FirebaseGoogleAuthController>(FirebaseGoogleAuthController);
    service = module.get<FirebaseGoogleAuthService>(FirebaseGoogleAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuth', () => {
    const mockIdToken = 'mock-firebase-id-token';
    const mockDto: GoogleAuthDto = { idToken: mockIdToken };
    const mockResponse = {
      success: true,
      message: 'Google login success',
      authorization: {
        token: 'jwt-token',
        type: 'bearer',
      },
      data: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      },
    };

    it('should call googleLogin method with correct parameters', async () => {
      mockFirebaseGoogleAuthService.googleLogin.mockResolvedValue(mockResponse);

      await controller.googleAuth(mockDto);

      expect(mockFirebaseGoogleAuthService.googleLogin).toHaveBeenCalledWith(mockIdToken);
    });

    it('should return the response from the service', async () => {
      mockFirebaseGoogleAuthService.googleLogin.mockResolvedValue(mockResponse);

      const result = await controller.googleAuth(mockDto);

      expect(result).toEqual(mockResponse);
    });

    it('should handle errors properly', async () => {
      const mockError = new Error('Authentication failed');
      mockFirebaseGoogleAuthService.googleLogin.mockRejectedValue(mockError);

      try {
        await controller.googleAuth(mockDto);
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
  });
});
