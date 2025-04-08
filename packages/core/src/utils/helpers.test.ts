import {
  isNullOrUndefined,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isClass,
  getTypeName,
  createServiceProxy
} from './helpers';

describe('Helper Functions', () => {
  describe('isNullOrUndefined', () => {
    it('identifies null/undefined values', () => {
      // Arrange & Act & Assert
      expect(isNullOrUndefined(null)).toBe(true);
      expect(isNullOrUndefined(undefined)).toBe(true);
      expect(isNullOrUndefined('')).toBe(false);
      expect(isNullOrUndefined(0)).toBe(false);
      expect(isNullOrUndefined(false)).toBe(false);
      expect(isNullOrUndefined({})).toBe(false);
      expect(isNullOrUndefined([])).toBe(false);
    });
  });

  describe('Type checking functions', () => {
    it('correctly identifies strings', () => {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
    });

    it('correctly identifies numbers', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(123)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber('123')).toBe(false);
    });

    it('correctly identifies booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
    });

    it('correctly identifies objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject(() => {})).toBe(false);
    });

    it('correctly identifies arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray('array')).toBe(false);
    });

    it('correctly identifies functions', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function() {})).toBe(true);
      expect(isFunction({})).toBe(false);
      expect(isFunction('function')).toBe(false);
    });

    it('correctly identifies classes', () => {
      class TestClass {}
      expect(isClass(TestClass)).toBe(true);
      expect(isClass(() => {})).toBe(false);
      expect(isClass(function() {})).toBe(false);
      expect(isClass({})).toBe(false);
    });
  });

  describe('getTypeName', () => {
    it('returns correct type names', () => {
      // Arrange
      class TestClass {}
      const anonymousClass = class {};
      
      // Act & Assert
      expect(getTypeName(null)).toBe('undefined');
      expect(getTypeName(undefined)).toBe('undefined');
      expect(getTypeName('string')).toBe('string');
      expect(getTypeName(TestClass)).toBe('TestClass');
      expect(getTypeName(anonymousClass)).toBe('anonymousClass');
      expect(getTypeName(() => {})).toBe('anonymous');
      expect(getTypeName({})).toBe('Object');
      expect(getTypeName([])).toBe('Array');
    });
  });

  describe('createServiceProxy', () => {
    it('returns typed proxy', () => {
      // Arrange
      class TestService {
        public getValue(): string {
          return 'test-value';
        }
      }
      
      // Act
      const proxy = createServiceProxy<TestService>(new TestService());
      
      // Assert
      expect(proxy.getValue()).toBe('test-value');
    });

    it('throws on missing property', () => {
      // Arrange
      class TestService {
        public getValue(): string {
          return 'test-value';
        }
      }
      
      // Act
      const proxy = createServiceProxy<any>(new TestService());
      
      // Assert
      expect(() => proxy.getNonExistentMethod()).toThrow(
        "Method or property 'getNonExistentMethod' does not exist on service 'TestService'"
      );
    });
  });
});