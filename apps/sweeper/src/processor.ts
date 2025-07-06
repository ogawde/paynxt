import { prisma, TransactionStatus, Transaction } from "@paynxt/database";

export async function processTransaction(
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(
      async (tx) => {
        const transaction = await tx.transaction.findFirst({
          where: {
            id: transactionId,
            status: TransactionStatus.PENDING,
          },
        });

        if (!transaction) {
          throw new Error("Transaction not found or already processed");
        }

        const [senderResult, recipientResult] = await Promise.all([
          tx.$queryRaw<Array<{ id: string; balance: bigint }>>`
            SELECT id, balance FROM users 
            WHERE id = ${transaction.fromUserId} 
            FOR UPDATE
          `,
          tx.$queryRaw<Array<{ id: string; balance: bigint }>>`
            SELECT id, balance FROM users 
            WHERE id = ${transaction.toUserId} 
            FOR UPDATE
          `,
        ]);

        if (!senderResult || senderResult.length === 0) {
          throw new Error("Sender not found");
        }

        if (!recipientResult || recipientResult.length === 0) {
          throw new Error("Recipient not found");
        }

        const senderBalance = Number(senderResult[0].balance);
        const recipientBalance = Number(recipientResult[0].balance);

        if (senderBalance < transaction.amount) {
        await tx.transaction.update({
            where: { id: transactionId },
            data: {
              status: TransactionStatus.FAILED,
              failureReason: "Insufficient balance",
              completedAt: new Date(),
            },
          });
          throw new Error("Insufficient balance");
        }

        await tx.user.update({
          where: { id: transaction.fromUserId },
          data: { balance: { decrement: transaction.amount } },
        });

        await tx.user.update({
          where: { id: transaction.toUserId },
          data: { balance: { increment: transaction.amount } },
        });

        await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: TransactionStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export async function fetchPendingTransactions(limit: number): Promise<Transaction[]> {
  return prisma.transaction.findMany({
    where: { status: TransactionStatus.PENDING },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

