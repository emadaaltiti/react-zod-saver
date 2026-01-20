import { UseSafeStorageOptions } from './types';
export declare function useSafeStorage<T>({ key, schema, defaultValue, version, migrate, }: UseSafeStorageOptions<T>): readonly [T, (value: T | ((val: T) => T)) => void];
