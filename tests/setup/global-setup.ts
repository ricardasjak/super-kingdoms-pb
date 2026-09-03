import { spawn, execSync } from 'child_process';
import { rmSync, mkdirSync } from 'fs';
import type { ChildProcess } from 'child_process';

let pbProcess: ChildProcess;

export async function setup() {
  // 1. Wipe test DB — guarantees a clean slate every run
  rmSync('pb_test_data', { recursive: true, force: true });
  mkdirSync('pb_test_data', { recursive: true });

  // 2. Start PB test instance — migrations run automatically on startup
  pbProcess = spawn(
    './pb/pocketbase',
    [
      'serve',
      '--dir=pb_test_data',
      '--hooksDir=pb/pb_hooks',
      '--migrationsDir=pb/pb_migrations',
      '--http=127.0.0.1:8092',
    ],
    { stdio: 'pipe' }
  );

  // 3. Wait for PB to be ready (poll health endpoint)
  await waitForPb('http://127.0.0.1:8092');

  // 4. Bootstrap: create superuser for admin operations in tests
  //    (PB requires a superuser to access admin APIs)
  execSync(
    `./pb/pocketbase superuser upsert test-admin@example.com test-admin-password --dir=pb_test_data`,
    { stdio: 'pipe' }
  );

  console.log('✓ PB test instance ready on :8092');
}

export async function teardown() {
  pbProcess?.kill();
  console.log('✓ PB test instance stopped.');
}

async function waitForPb(url: string, maxWaitMs = 15000): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`PocketBase test instance did not start within ${maxWaitMs}ms`);
}
