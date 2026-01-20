import { z } from "zod";

export interface UseSafeStorageOptions<T> {
  key: string;
  schema: z.ZodSchema<T>;
  defaultValue: T;
  version?: number;
  migrate?: (oldData: any, oldVersion: number) => T;
}

export interface StorageEnvelope<T> {
  data: T;
  version: number;
}
