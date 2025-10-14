import { Test, TestingModule } from '@nestjs/testing';
import { SaddleAlertService } from './saddle-alert.service';

describe('SaddleAlertService', () => {
  let service: SaddleAlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaddleAlertService],
    }).compile();

    service = module.get<SaddleAlertService>(SaddleAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
