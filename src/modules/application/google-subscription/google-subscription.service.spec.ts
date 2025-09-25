import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSubscriptionService } from './google-subscription.service';

describe('GoogleSubscriptionService', () => {
  let service: GoogleSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSubscriptionService],
    }).compile();

    service = module.get<GoogleSubscriptionService>(GoogleSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
