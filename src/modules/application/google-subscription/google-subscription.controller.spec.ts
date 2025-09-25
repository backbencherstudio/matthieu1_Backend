import { Test, TestingModule } from '@nestjs/testing';
import { GoogleSubscriptionController } from './google-subscription.controller';
import { GoogleSubscriptionService } from './google-subscription.service';

describe('GoogleSubscriptionController', () => {
  let controller: GoogleSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoogleSubscriptionController],
      providers: [GoogleSubscriptionService],
    }).compile();

    controller = module.get<GoogleSubscriptionController>(GoogleSubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
