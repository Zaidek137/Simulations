type AdminOperationAccount = {
  address: string;
  signMessage: (args: { message: string }) => Promise<string>;
};

let activeAdminAccount: AdminOperationAccount | null = null;
const registeredAccounts = new Map<string, AdminOperationAccount>();

function refreshActiveAccount(): void {
  const accounts = [...registeredAccounts.values()];
  activeAdminAccount = accounts[accounts.length - 1] || null;
}

export function setSimulationsAdminAccount(
  account: AdminOperationAccount | null,
  owner = 'default'
): void {
  if (account) {
    registeredAccounts.set(owner, account);
  } else {
    registeredAccounts.delete(owner);
  }

  refreshActiveAccount();
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getSigningMessage(payload: {
  walletAddress: string;
  operation: string;
  nonce: string;
  timestamp: number;
  argsHash: string;
}): string {
  return [
    'Scavenjer Simulations Admin API',
    `Wallet: ${payload.walletAddress.toLowerCase()}`,
    `Operation: ${payload.operation}`,
    `Nonce: ${payload.nonce}`,
    `Timestamp: ${payload.timestamp}`,
    `Args Hash: ${payload.argsHash}`,
  ].join('\n');
}

export async function adminOperation<T>(
  operation: string,
  args: Record<string, unknown>
): Promise<T> {
  const account = activeAdminAccount;
  if (!account?.address) {
    throw new Error('Connected admin wallet is required to authorize this action.');
  }

  const timestamp = Date.now();
  const nonce = crypto.randomUUID();
  const argsHash = await sha256(JSON.stringify(args || {}));
  const message = getSigningMessage({
    walletAddress: account.address,
    operation,
    nonce,
    timestamp,
    argsHash,
  });
  const signature = await account.signMessage({ message });

  const response = await fetch('/api/admin/operations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      operation,
      args,
      walletAddress: account.address,
      timestamp,
      nonce,
      argsHash,
      signature,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Admin operation failed');
  }

  return result.data as T;
}
