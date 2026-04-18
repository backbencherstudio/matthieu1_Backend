import { Test, TestingModule } from '@nestjs/testing';
import { MainproductService } from './mainproduct.service';

describe('MainproductService', () => {
  let service: MainproductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainproductService],
    }).compile();

    service = module.get<MainproductService>(MainproductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
