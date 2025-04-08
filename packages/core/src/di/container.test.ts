import 'reflect-metadata';
import { ServiceCollection } from './container';
import { ServiceLifetime } from './types';
import { Injectable, Inject, INJECT_METADATA_KEY } from './decorators';

// Mock Reflect.getMetadata for design:paramtypes
const originalGetMetadata = Reflect.getMetadata;
Reflect.getMetadata = jest.fn((key, target) => {
  if (key === 'design:paramtypes' && target === DependentService) {
    return [TestService];
  }
  if (key === INJECT_METADATA_KEY && target === DependentService) {
    return [{ index: 0, type: TestService }];
  }
  return originalGetMetadata(key, target);
});

// Test classes
@Injectable()
class TestService {
  public getValue(): string {
    return 'test-value';
  }
}

@Injectable()
class DependentService {
  constructor(@Inject() private readonly testService: TestService) {}

  public getTestValue(): string {
    return this.testService.getValue();
  }
}

describe('ServiceCollection', () => {
  let services: ServiceCollection;

  beforeEach(() => {
    services = new ServiceCollection();
  });

  describe('addSingleton', () => {
    it('should register a singleton service', () => {
      // Arrange & Act
      services.addSingleton(TestService);
      const provider = services.buildServiceProvider();

      // Assert
      const service1 = provider.getService<TestService>(TestService);
      const service2 = provider.getService<TestService>(TestService);

      expect(service1).toBeInstanceOf(TestService);
      expect(service1).toBe(service2); // Same instance
    });
  });

  describe('addTransient', () => {
    it('should register a transient service', () => {
      // Arrange & Act
      services.addTransient(TestService);
      const provider = services.buildServiceProvider();

      // Assert
      const service1 = provider.getService<TestService>(TestService);
      const service2 = provider.getService<TestService>(TestService);

      expect(service1).toBeInstanceOf(TestService);
      expect(service2).toBeInstanceOf(TestService);
      expect(service1).not.toBe(service2); // Different instances
    });
  });

  describe('addScoped', () => {
    it('should register a scoped service', () => {
      // Arrange & Act
      services.addScoped(TestService);
      const provider = services.buildServiceProvider();
      const scope1 = provider.createScope();
      const scope2 = provider.createScope();

      // Assert
      const service1FromScope1 = scope1.serviceProvider.getService<TestService>(TestService);
      const service2FromScope1 = scope1.serviceProvider.getService<TestService>(TestService);
      const serviceFromScope2 = scope2.serviceProvider.getService<TestService>(TestService);

      expect(service1FromScope1).toBeInstanceOf(TestService);
      expect(service1FromScope1).toBe(service2FromScope1); // Same instance within scope
      expect(service1FromScope1).not.toBe(serviceFromScope2); // Different instances between scopes
    });
  });

  describe('dependency resolution', () => {
    it('should resolve dependencies automatically', () => {
      // Arrange
      services.addSingleton(TestService);
      services.addSingleton(DependentService);

      // Act
      const provider = services.buildServiceProvider();
      const dependentService = provider.getService<DependentService>(DependentService);

      // Assert
      expect(dependentService).toBeInstanceOf(DependentService);
      expect(dependentService.getTestValue()).toBe('test-value');
    });
  });
});
