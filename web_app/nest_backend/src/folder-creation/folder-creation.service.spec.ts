import { Test, TestingModule } from '@nestjs/testing';
import { FolderCreationService } from './folder-creation.service';

describe('FolderCreationService', () => {
  let service: FolderCreationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderCreationService],
    }).compile();

    service = module.get<FolderCreationService>(FolderCreationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
