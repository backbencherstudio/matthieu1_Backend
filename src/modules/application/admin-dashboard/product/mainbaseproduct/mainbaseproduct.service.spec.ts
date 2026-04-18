import { Test, TestingModule } from '@nestjs/testing';
import { MainbaseproductService } from './mainbaseproduct.service';

describe('MainbaseproductService', () => {
  let service: MainbaseproductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MainbaseproductService],
    }).compile();

    service = module.get<MainbaseproductService>(MainbaseproductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
