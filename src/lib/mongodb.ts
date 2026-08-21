import { MongoClient, Db, Collection, Document, MongoClientOptions, ServerApiVersion } from "mongodb";

// Resolve MongoDB Connection URI from environment
const uri = process.env.MONGODB_URI || process.env.DATABASE;
const defaultDbName = process.env.MONGODB_DB || "osteosys";

if (!uri) {
  console.warn(
    "⚠️ [MongoDB Warning]: MONGODB_URI or DATABASE environment variable is not defined. Database operations will fail unless configured in .env."
  );
}

const options: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Global Caching Pattern for Next.js in Development
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  // Graceful fallback dummy promise in case URI is missing at build time
  clientPromise = Promise.reject(
    new Error("MongoDB connection URI is missing. Please set MONGODB_URI or DATABASE in .env.")
  );
} else if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Shared MongoClient Promise instance
 */
export default clientPromise;

/**
 * Helper to retrieve a connected MongoDB Db instance directly
 */
export async function getDatabase(dbName: string = defaultDbName): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

/**
 * Generic TypeScript helper to retrieve a typed Collection<T>
 */
export async function getCollection<T extends Document = Document>(
  collectionName: string,
  dbName: string = defaultDbName
): Promise<Collection<T>> {
  const db = await getDatabase(dbName);
  return db.collection<T>(collectionName);
}

/**
 * Diagnostic helper to test connection status, latency, and list collections
 */
export async function checkDatabaseConnection(dbName: string = defaultDbName): Promise<{
  isConnected: boolean;
  latencyMs: number;
  databaseName: string;
  collections: string[];
  error?: string;
}> {
  const startTime = Date.now();
  try {
    const db = await getDatabase(dbName);
    // Ping command
    await db.command({ ping: 1 });
    const latencyMs = Date.now() - startTime;

    // List collections
    const collectionsList = await db.listCollections().toArray();
    const collectionNames = collectionsList.map((c) => c.name);

    return {
      isConnected: true,
      latencyMs,
      databaseName: db.databaseName,
      collections: collectionNames,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    return {
      isConnected: false,
      latencyMs,
      databaseName: dbName,
      collections: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
