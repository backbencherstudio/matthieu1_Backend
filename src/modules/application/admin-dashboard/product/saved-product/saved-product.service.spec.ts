import { Test, TestingModule } from '@nestjs/testing';
import { SavedProductService } from './saved-product.service';

describe('SavedProductService', () => {
  let service: SavedProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SavedProductService],
    }).compile();

    service = module.get<SavedProductService>(SavedProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
