import { ZepClient } from "@getzep/zep-cloud";
import { env } from "~/env";

const zep = new ZepClient({
  apiKey: env.ZEP_API_KEY as string,
});

export default zep;
