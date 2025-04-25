import { CohereClient } from "cohere-ai";
import { env } from "~/env";

const cohere = new CohereClient({ token: env.COHERE_API_KEY as string });

export default cohere;
