import { Test, TestingModule } from '@nestjs/testing';
import { SadllesService } from './sadlles.service';

describe('SadllesService', () => {
  let service: SadllesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SadllesService],
    }).compile();

    service = module.get<SadllesService>(SadllesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
