import PocketBase, { type RecordModel } from 'pocketbase';
import type { TypedPocketBase } from '../types/pb.model';

export const POCKETBASE_URL =
  import.meta.env.VITE_POCKETBASE_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://127.0.0.1:8090');

export const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;

export interface PocketBaseUser extends RecordModel {
  email: string;
  name?: string;
  avatar?: string;
}

export interface PbHealthStatus {
  isOnline: boolean;
  code?: number;
  message: string;
}

export async function checkPbHealth(): Promise<PbHealthStatus> {
  try {
    const res = await pb.health.check();
    return {
      isOnline: true,
      code: res.code,
      message: res.message || 'PocketBase is healthy and connected',
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : 'Unable to connect to PocketBase server';
    return {
      isOnline: false,
      message: errorMsg,
    };
  }
}
