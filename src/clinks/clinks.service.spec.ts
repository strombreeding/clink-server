import { Test, TestingModule } from '@nestjs/testing';
import { ClinksService } from './clinks.service';

describe('ClinksService', () => {
  let service: ClinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClinksService],
    }).compile();

    service = module.get<ClinksService>(ClinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
