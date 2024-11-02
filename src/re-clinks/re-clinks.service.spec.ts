import { Test, TestingModule } from '@nestjs/testing';
import { ReClinksService } from './re-clinks.service';

describe('ReClinksService', () => {
  let service: ReClinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReClinksService],
    }).compile();

    service = module.get<ReClinksService>(ReClinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
