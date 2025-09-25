import { Test, TestingModule } from '@nestjs/testing';
import { TpaypalService } from './tpaypal.service';

describe('TpaypalService', () => {
  let service: TpaypalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TpaypalService],
    }).compile();

    service = module.get<TpaypalService>(TpaypalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
