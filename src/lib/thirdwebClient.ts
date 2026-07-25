import { createThirdwebClient } from "thirdweb";

// Use the same env-provided client ID as scavenjersite for consistency.
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "missing-client-id";

export const client = createThirdwebClient({ clientId });
