import { Router } from "express";
import { prisma, TransactionStatus, TransactionType } from "@paynxt/database";
import { transferSchema } from "@paynxt/types";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

const router = Router();

router.use(requireAuth);

router.post("/transfer", async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const validatedData = transferSchema.parse(req.body);

    const recipient = await prisma.user.findUnique({
      where: { email: validatedData.toEmail },
    });

    if (!recipient) {
      throw new AppError("Recipient not found", 404);
    }

    if (recipient.id === req.user.userId) {
      throw new AppError("Cannot transfer to yourself", 400);
    }

    const sender = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { balance: true },
    });

    if (!sender) {
      throw new AppError("Sender not found", 404);
    }

    if (sender.balance < validatedData.amount) {
      throw new AppError("Insufficient balance", 400);
    }

    const transaction = await prisma.transaction.create({
      data: {
        fromUserId: req.user.userId,
        toUserId: recipient.id,
        amount: validatedData.amount,
        status: TransactionStatus.PENDING,
        type: TransactionType.TRANSFER,
      },
      include: {
        fromUser: {
          select: { email: true, userType: true },
        },
        toUser: {
          select: { email: true, userType: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { transaction },
      message: "Transfer initiated. Processing in background.",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/history", async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as TransactionStatus | undefined;

    const where = {
      OR: [
        { fromUserId: req.user.userId },
        { toUserId: req.user.userId },
      ],
      ...(status && { status }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          fromUser: {
            select: { email: true, userType: true },
          },
          toUser: {
            select: { email: true, userType: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
      include: {
        fromUser: {
          select: { email: true, userType: true },
        },
        toUser: {
          select: { email: true, userType: true },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (
      transaction.fromUserId !== req.user.userId &&
      transaction.toUserId !== req.user.userId
    ) {
      throw new AppError("Access denied", 403);
    }

    res.json({
      success: true,
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

