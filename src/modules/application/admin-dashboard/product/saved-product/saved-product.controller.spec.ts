import { Test, TestingModule } from '@nestjs/testing';
import { SavedProductController } from './saved-product.controller';
import { SavedProductService } from './saved-product.service';

describe('SavedProductController', () => {
  let controller: SavedProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedProductController],
      providers: [SavedProductService],
    }).compile();

    controller = module.get<SavedProductController>(SavedProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
