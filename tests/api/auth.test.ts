import { describe, it, expect } from 'vitest';
import { createClient, createAuthClient } from '../setup/helpers';

describe('Auth', () => {
  it('registers a new user', async () => {
    const pb = createClient();
    const user = await pb.collection('users').create({
      email: 'new@example.com',
      password: 'Test1234!',
      passwordConfirm: 'Test1234!',
    });
    expect(user.id).toBeDefined();
    // In PB, email is private by default to unauthenticated requests unless emailVisibility is true
    // Log in to verify email access
    const authData = await pb.collection('users').authWithPassword('new@example.com', 'Test1234!');
    expect(authData.record?.email).toBe('new@example.com');
  });

  it('logs in with correct credentials', async () => {
    const { pb, email } = await createAuthClient('login-test');
    expect(pb.authStore.isValid).toBe(true);
    expect(pb.authStore.record?.email).toBe(email);
  });

  it('rejects wrong password', async () => {
    await createAuthClient('badpass');
    const pb = createClient();
    await expect(
      pb.collection('users').authWithPassword('test-badpass@example.com', 'WRONG')
    ).rejects.toThrow();
  });
});
