import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { FirebaseGoogleAuthService } from './firebase-googleauth.service';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('FirebaseGoogleAuthService', () => {
  let service: FirebaseGoogleAuthService;
  let firebaseAdminService: FirebaseAdminService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockFirebaseAdminService = {
    verifyIdToken: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseGoogleAuthService,
        {
          provide: FirebaseAdminService,
          useValue: mockFirebaseAdminService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<FirebaseGoogleAuthService>(FirebaseGoogleAuthService);
    firebaseAdminService = module.get<FirebaseAdminService>(FirebaseAdminService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('googleLogin', () => {
    const mockIdToken = 'mock-firebase-id-token';
    const mockDecodedToken = {
      uid: 'firebase-uid',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
    };
    const mockJwtToken = 'mock-jwt-token';
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg',
      google_id: 'firebase-uid',
    };

    it('should throw BadRequestException if idToken is not provided', async () => {
      await expect(service.googleLogin('')).rejects.toThrow(BadRequestException);
    });

    it('should verify the Firebase ID token', async () => {
      mockFirebaseAdminService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      await service.googleLogin(mockIdToken);

      expect(mockFirebaseAdminService.verifyIdToken).toHaveBeenCalledWith(mockIdToken);
    });

    it('should create a new user if user does not exist', async () => {
      mockFirebaseAdminService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      await service.googleLogin(mockIdToken);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { google_id: mockDecodedToken.uid },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: mockDecodedToken.email,
          name: mockDecodedToken.name,
          avatar: mockDecodedToken.picture,
          google_id: mockDecodedToken.uid,
        },
      });
    });

    it('should update existing user if user exists', async () => {
      mockFirebaseAdminService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      await service.googleLogin(mockIdToken);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          email: mockDecodedToken.email,
          name: mockDecodedToken.name,
          avatar: mockDecodedToken.picture,
        },
      });
    });

    it('should generate a JWT token', async () => {
      mockFirebaseAdminService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      await service.googleLogin(mockIdToken);

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should return the expected response structure', async () => {
      mockFirebaseAdminService.verifyIdToken.mockResolvedValue(mockDecodedToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockJwtToken);

      const result = await service.googleLogin(mockIdToken);

      expect(result).toEqual({
        success: true,
        message: 'Google login success',
        authorization: {
          token: mockJwtToken,
          type: 'bearer',
        },
        data: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          avatar: mockUser.avatar,
        },
      });
    });

    it('should handle Firebase verification errors', async () => {
      const mockError = new Error('Invalid token');
      mockFirebaseAdminService.verifyIdToken.mockRejectedValue(mockError);

      await expect(service.googleLogin(mockIdToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});
