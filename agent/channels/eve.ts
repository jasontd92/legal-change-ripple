import { localDev } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

// eve dev authenticates every caller while EVE_DEV=1, which is what the local product page uses.
export default eveChannel({
  auth: [localDev()],
});
