import { Test, TestingModule } from '@nestjs/testing';
import { UsedSaddleService } from './used-saddle.service';

describe('UsedSaddleService', () => {
  let service: UsedSaddleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsedSaddleService],
    }).compile();

    service = module.get<UsedSaddleService>(UsedSaddleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
