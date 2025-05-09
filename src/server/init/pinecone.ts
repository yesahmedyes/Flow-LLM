import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "~/env";

const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY as string });

export default pinecone;
