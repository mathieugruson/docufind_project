import { Test, TestingModule } from '@nestjs/testing';
import { FolderCreationGateway } from './folder-creation.gateway';

describe('FolderCreationGateway', () => {
  let gateway: FolderCreationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FolderCreationGateway],
    }).compile();

    gateway = module.get<FolderCreationGateway>(FolderCreationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
