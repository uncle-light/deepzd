import type { BaseCheckpointSaver } from "@langchain/langgraph-checkpoint";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const CONNECTION_STRING_ENV_KEYS = [
  "LANGGRAPH_DATABASE_URL",
  "deepzd_db_POSTGRES_URL_NON_POOLING",
  "deepzd_db_POSTGRES_URL",
  "DATABASE_URL",
  "POSTGRES_URL",
  "deepzd_DATABASE_URL_UNPOOLED",
  "deepzd_DATABASE_URL",
] as const;

let checkpointerPromise: Promise<BaseCheckpointSaver> | null = null;

function resolveConnectionString(): string | undefined {
  for (const key of CONNECTION_STRING_ENV_KEYS) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function resolveSchema(): string {
  const schema = process.env.LANGGRAPH_CHECKPOINT_SCHEMA?.trim();
  return schema || "public";
}

/**
 * Shared LangGraph checkpointer.
 *
 * Priority:
 * 1) Postgres checkpointer (persistent checkpoints)
 * 2) MemorySaver fallback (process memory only)
 */
export async function getLangGraphCheckpointer(): Promise<BaseCheckpointSaver> {
  if (!checkpointerPromise) {
    checkpointerPromise = (async () => {
      const connString = resolveConnectionString();

      if (!connString) {
        console.warn("[langgraph:checkpointer] No database URL found, using MemorySaver");
        return new MemorySaver();
      }

      try {
        const saver = PostgresSaver.fromConnString(connString, {
          schema: resolveSchema(),
        });

        // Safe to call repeatedly; migrations are no-op after first setup.
        await saver.setup();

        console.info("[langgraph:checkpointer] Using PostgresSaver");
        return saver;
      } catch (error) {
        console.error("[langgraph:checkpointer] Postgres setup failed, falling back to MemorySaver", error);
        return new MemorySaver();
      }
    })();
  }

  return checkpointerPromise;
}
