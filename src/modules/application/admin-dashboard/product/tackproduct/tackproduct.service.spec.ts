import { Test, TestingModule } from '@nestjs/testing';
import { TackproductService } from './tackproduct.service';
import { productcategory } from '@prisma/client';

describe('TackproductService', () => {
  let service: TackproductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TackproductService],
    }).compile();

    service = module.get<TackproductService>(TackproductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
