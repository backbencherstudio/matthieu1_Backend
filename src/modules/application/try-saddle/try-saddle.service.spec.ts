import { Test, TestingModule } from '@nestjs/testing';
import { TrySaddleService } from './try-saddle.service';

describe('TrySaddleService', () => {
  let service: TrySaddleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrySaddleService],
    }).compile();

    service = module.get<TrySaddleService>(TrySaddleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
