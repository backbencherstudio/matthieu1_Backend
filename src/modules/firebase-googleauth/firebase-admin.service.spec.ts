import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';

jest.mock('firebase-admin/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn().mockReturnValue([]),
}));

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn(),
  }),
}));

describe('FirebaseAdminService', () => {
  let service: FirebaseAdminService;
  let mockAuth: any;

  beforeEach(async () => {
    // Reset environment variables for testing
    process.env.FIREBASE_PROJECT_ID = 'test-project-id';
    process.env.FIREBASE_CLIENT_EMAIL = 'test-client-email';
    process.env.FIREBASE_PRIVATE_KEY = 'test-private-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseAdminService],
    }).compile();

    service = module.get<FirebaseAdminService>(FirebaseAdminService);
    mockAuth = require('firebase-admin/auth').getAuth();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyIdToken', () => {
    const mockIdToken = 'mock-firebase-id-token';
    const mockDecodedToken = {
      uid: 'firebase-uid',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/avatar.jpg',
    };

    it('should throw UnauthorizedException if idToken is not provided', async () => {
      await expect(service.verifyIdToken('')).rejects.toThrow(UnauthorizedException);
    });

    it('should call Firebase auth verifyIdToken with the provided token', async () => {
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      await service.verifyIdToken(mockIdToken);

      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(mockIdToken);
    });

    it('should return the decoded token on successful verification', async () => {
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await service.verifyIdToken(mockIdToken);

      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw UnauthorizedException on Firebase verification error', async () => {
      const mockError = new Error('Invalid token');
      mockAuth.verifyIdToken.mockRejectedValue(mockError);

      await expect(service.verifyIdToken(mockIdToken)).rejects.toThrow(UnauthorizedException);
    });
  });
});