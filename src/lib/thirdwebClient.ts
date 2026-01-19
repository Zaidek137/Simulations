import { createThirdwebClient } from "thirdweb";

// Use the same client ID as scavenjersite for consistency
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "dc56b7276133338ec60eebc93d1c38b1";

export const client = createThirdwebClient({ clientId });
