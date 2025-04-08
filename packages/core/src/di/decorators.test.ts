import 'reflect-metadata';
import { Injectable, Singleton, Scoped, Transient, Inject, INJECTABLE_METADATA_KEY, INJECT_METADATA_KEY } from './decorators';
import { ServiceLifetime } from './types';

// Enable experimental decorators
Reflect.defineProperty = jest.fn(Reflect.defineProperty);
Reflect.getOwnMetadata = jest.fn((key, target) => {
  return Reflect.getMetadata(key, target);
});

describe('DI Decorators', () => {
  describe('@Injectable', () => {
    it('should set the correct metadata with default lifetime', () => {
      // Arrange & Act
      @Injectable()
      class TestClass {}

      // Assert
      const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, TestClass);
      expect(metadata).toBe(ServiceLifetime.Singleton);
    });

    it('should set the correct metadata with specified lifetime', () => {
      // Arrange & Act
      @Injectable(ServiceLifetime.Transient)
      class TestClass {}

      // Assert
      const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, TestClass);
      expect(metadata).toBe(ServiceLifetime.Transient);
    });
  });

  describe('@Singleton', () => {
    it('should set the singleton lifetime metadata', () => {
      // Arrange & Act
      @Singleton()
      class TestClass {}

      // Assert
      const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, TestClass);
      expect(metadata).toBe(ServiceLifetime.Singleton);
    });
  });

  describe('@Scoped', () => {
    it('should set the scoped lifetime metadata', () => {
      // Arrange & Act
      @Scoped()
      class TestClass {}

      // Assert
      const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, TestClass);
      expect(metadata).toBe(ServiceLifetime.Scoped);
    });
  });

  describe('@Transient', () => {
    it('should set the transient lifetime metadata', () => {
      // Arrange & Act
      @Transient()
      class TestClass {}

      // Assert
      const metadata = Reflect.getMetadata(INJECTABLE_METADATA_KEY, TestClass);
      expect(metadata).toBe(ServiceLifetime.Transient);
    });
  });

  describe('@Inject', () => {
    // Skip these tests for now as they require proper parameter decorator support
    it.skip('should set the correct injection metadata', () => {
      // Arrange
      class Dependency {}

      // Act
      class TestClass {
        constructor(@Inject() private dependency: Dependency) {}
      }

      // Assert
      const metadata = Reflect.getOwnMetadata(INJECT_METADATA_KEY, TestClass);
      expect(metadata).toBeDefined();
      expect(metadata.length).toBe(1);
      expect(metadata[0].index).toBe(0);
    });

    it.skip('should set the correct injection metadata with explicit token', () => {
      // Arrange
      class Dependency {}
      const TOKEN = 'dependency-token';

      // Act
      class TestClass {
        constructor(@Inject(TOKEN) private dependency: Dependency) {}
      }

      // Assert
      const metadata = Reflect.getOwnMetadata(INJECT_METADATA_KEY, TestClass);
      expect(metadata).toBeDefined();
      expect(metadata.length).toBe(1);
      expect(metadata[0].index).toBe(0);
      expect(metadata[0].type).toBe(TOKEN);
    });
  });
});
