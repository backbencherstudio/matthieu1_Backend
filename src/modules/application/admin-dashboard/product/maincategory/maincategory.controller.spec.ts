import { Test, TestingModule } from '@nestjs/testing';
import { MaincategoryController } from './maincategory.controller';
import { MaincategoryService } from './maincategory.service';

describe('MaincategoryController', () => {
  let controller: MaincategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaincategoryController],
      providers: [MaincategoryService],
    }).compile();

    controller = module.get<MaincategoryController>(MaincategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
