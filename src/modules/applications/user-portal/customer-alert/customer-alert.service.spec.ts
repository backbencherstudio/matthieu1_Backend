import { Test, TestingModule } from '@nestjs/testing';
import { CustomerAlertService } from './customer-alert.service';

describe('CustomerAlertService', () => {
  let service: CustomerAlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerAlertService],
    }).compile();

    service = module.get<CustomerAlertService>(CustomerAlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
