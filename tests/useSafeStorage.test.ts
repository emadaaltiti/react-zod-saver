import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { useSafeStorage } from '../src/useSafeStorage';

const TestSchema = z.object({
  name: z.string(),
  count: z.number(),
});

describe('useSafeStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with default value if storage is empty', () => {
    const { result } = renderHook(() =>
      useSafeStorage({
        key: 'test-key',
        schema: TestSchema,
        defaultValue: { name: 'Default', count: 0 },
      })
    );

    expect(result.current[0]).toEqual({ name: 'Default', count: 0 });
  });

  it('should save value to localStorage when state updates', () => {
    const { result } = renderHook(() =>
      useSafeStorage({
        key: 'test-key',
        schema: TestSchema,
        defaultValue: { name: 'Default', count: 0 },
      })
    );

    act(() => {
      result.current[1]({ name: 'Updated', count: 10 });
    });

    const stored = JSON.parse(localStorage.getItem('test-key')!);
    expect(stored.data).toEqual({ name: 'Updated', count: 10 });
    expect(stored.version).toBe(1);
  });

  it('should revert to default value if storage data is invalid', () => {
    // Manually set corrupted data
    localStorage.setItem('test-key', JSON.stringify({ data: { name: 123, count: "wrong" }, version: 1 }));

    const { result } = renderHook(() =>
      useSafeStorage({
        key: 'test-key',
        schema: TestSchema,
        defaultValue: { name: 'Fallback', count: 0 },
      })
    );

    expect(result.current[0].name).toBe('Fallback');
  });

  it('should successfully migrate data from an old version', () => {
    // Store V1 data
    const v1Data = { data: { name: 'Old User' }, version: 1 };
    localStorage.setItem('test-key', JSON.stringify(v1Data));

    // Define V2 Schema (added 'count' field)
    const V2Schema = z.object({ name: z.string(), count: z.number() });

    const { result } = renderHook(() =>
      useSafeStorage({
        key: 'test-key',
        schema: V2Schema,
        version: 2,
        defaultValue: { name: 'New', count: 0 },
        migrate: (oldData, oldVersion) => {
          if (oldVersion === 1) {
            return { ...oldData, count: 99 };
          }
          return oldData;
        },
      })
    );

    expect(result.current[0]).toEqual({ name: 'Old User', count: 99 });
  });

  it('should sync state across tabs when storage event fires', () => {
    const { result } = renderHook(() =>
      useSafeStorage({
        key: 'test-key',
        schema: TestSchema,
        defaultValue: { name: 'Initial', count: 0 },
      })
    );

    // Simulate another tab updating localStorage
    const newValue = { data: { name: 'Remote Change', count: 5 }, version: 1 };
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify(newValue),
        })
      );
    });

    expect(result.current[0].name).toBe('Remote Change');
  });
});