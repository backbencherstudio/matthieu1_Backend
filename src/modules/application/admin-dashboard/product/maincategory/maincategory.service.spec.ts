import { Test, TestingModule } from '@nestjs/testing';
import { MaincategoryService } from './maincategory.service';

describe('MaincategoryService', () => {
  let service: MaincategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaincategoryService],
    }).compile();

    service = module.get<MaincategoryService>(MaincategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
