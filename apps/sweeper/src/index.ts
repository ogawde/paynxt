import { processTransaction, fetchPendingTransactions } from "./processor";
import { prisma } from "@paynxt/database";
import { config } from "./config";

let isShuttingDown = false;

async function runSweeperLoop(): Promise<void> {
  console.log("🧹 Transaction Sweeper Service started");
  console.log(`⚙️  Poll interval: ${config.pollIntervalMs}ms`);
  console.log(`📦 Batch size: ${config.batchSize}`);
  console.log("---");

  while (!isShuttingDown) {
    try {
      const pendingTransactions = await fetchPendingTransactions(config.batchSize);

      if (pendingTransactions.length === 0) {
        console.log(`⏳ No pending transactions. Waiting ${config.pollIntervalMs}ms...`);
      } else {
        console.log(`📝 Found ${pendingTransactions.length} pending transaction(s). Processing...`);

        for (const tx of pendingTransactions) {
          if (isShuttingDown) break;

          console.log(`  🔄 Processing transaction ${tx.id.substring(0, 8)}... (${tx.fromUserId.substring(0, 8)} → ${tx.toUserId.substring(0, 8)}, amount: ${tx.amount})`);
          
          const result = await processTransaction(tx.id);
          
          if (result.success) {
            console.log(`  ✓ Transaction ${tx.id.substring(0, 8)}... processed successfully`);
          } else {
            console.log(`  ✗ Transaction ${tx.id.substring(0, 8)}... failed: ${result.error}`);
          }
        }

        console.log(`✅ Batch processing complete`);
        console.log("---");
      }

      await sleep(config.pollIntervalMs);
    } catch (error) {
      console.error("❌ Error in sweeper loop:", error);
      console.log("⚠️  Continuing after error...");
      
      await sleep(config.pollIntervalMs);
    }
  }

  console.log("🛑 Sweeper loop stopped");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function shutdown(signal: string): Promise<void> {
  console.log(`\n⚠️  Received ${signal}. Initiating graceful shutdown...`);
  
  isShuttingDown = true;

  await sleep(2000);

  await prisma.$disconnect();
  
  console.log("👋 Sweeper service stopped gracefully");
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

runSweeperLoop().catch(async (error) => {
  console.error("💥 Fatal error in sweeper:", error);
  await prisma.$disconnect();
  process.exit(1);
});

