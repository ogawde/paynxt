import { processTransaction, fetchPendingTransactions } from "./processor";
import { prisma } from "@paynxt/database";
import { config } from "./config";

let isShuttingDown = false;

async function runSweeperLoop(): Promise<void> {
  while (!isShuttingDown) {
    try {
      const pendingTransactions = await fetchPendingTransactions(config.batchSize);

      if (pendingTransactions.length !== 0) {
        for (const tx of pendingTransactions) {
          if (isShuttingDown) break;

          await processTransaction(tx.id);
        }
      }

      await sleep(config.pollIntervalMs);
    } catch (error) {
      await sleep(config.pollIntervalMs);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function shutdown(signal: string): Promise<void> {
  isShuttingDown = true;

  await sleep(2000);

  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

runSweeperLoop().catch(async () => {
  await prisma.$disconnect();
  process.exit(1);
});

