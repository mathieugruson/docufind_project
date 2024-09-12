import { Test, TestingModule } from '@nestjs/testing';
import { QueryGateway } from './query.gateway';

describe('QueryGateway', () => {
  let gateway: QueryGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueryGateway],
    }).compile();

    gateway = module.get<QueryGateway>(QueryGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
