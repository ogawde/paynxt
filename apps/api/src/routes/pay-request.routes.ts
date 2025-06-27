import { Router } from "express";
import { prisma, UserType, PayRequestStatus, TransactionStatus, TransactionType } from "@paynxt/database";
import { createPayRequestSchema } from "@paynxt/types";
import { requireAuth, requireUserType } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";

const router = Router();

router.use(requireAuth);

router.post("/create", requireUserType(UserType.MERCHANT), async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const validatedData = createPayRequestSchema.parse(req.body);

    const consumer = await prisma.user.findUnique({
      where: { email: validatedData.consumerEmail },
    });

    if (!consumer) {
      throw new AppError("Consumer not found", 404);
    }

    if (consumer.userType !== UserType.CONSUMER) {
      throw new AppError("Pay requests can only be sent to consumers", 400);
    }

    if (consumer.id === req.user.userId) {
      throw new AppError("Cannot create pay request to yourself", 400);
    }

    const payRequest = await prisma.payRequest.create({
      data: {
        merchantId: req.user.userId,
        consumerId: consumer.id,
        amount: validatedData.amount,
        message: validatedData.message,
        status: PayRequestStatus.PENDING,
      },
      include: {
        merchant: {
          select: { email: true, userType: true },
        },
        consumer: {
          select: { email: true, userType: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { payRequest },
      message: "Pay request created successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/sent", requireUserType(UserType.MERCHANT), async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const payRequests = await prisma.payRequest.findMany({
      where: { merchantId: req.user.userId },
      include: {
        consumer: {
          select: { email: true, userType: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        payRequests,
        total: payRequests.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/received", requireUserType(UserType.CONSUMER), async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const payRequests = await prisma.payRequest.findMany({
      where: { consumerId: req.user.userId },
      include: {
        merchant: {
          select: { email: true, userType: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: {
        payRequests,
        total: payRequests.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/approve", requireUserType(UserType.CONSUMER), async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const payRequest = await prisma.payRequest.findUnique({
      where: { id: req.params.id },
      include: {
        merchant: { select: { email: true } },
        consumer: { select: { balance: true } },
      },
    });

    if (!payRequest) {
      throw new AppError("Pay request not found", 404);
    }

    if (payRequest.consumerId !== req.user.userId) {
      throw new AppError("Access denied", 403);
    }

    if (payRequest.status !== PayRequestStatus.PENDING) {
      throw new AppError(`Pay request already ${payRequest.status.toLowerCase()}`, 400);
    }

    if (payRequest.consumer.balance < payRequest.amount) {
      throw new AppError("Insufficient balance", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedPayRequest = await tx.payRequest.update({
        where: { id: req.params.id },
        data: { status: PayRequestStatus.APPROVED },
        include: {
          merchant: { select: { email: true, userType: true } },
          consumer: { select: { email: true, userType: true } },
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          fromUserId: payRequest.consumerId,
          toUserId: payRequest.merchantId,
          amount: payRequest.amount,
          status: TransactionStatus.PENDING,
          type: TransactionType.PAY_REQUEST,
        },
      });

      return { updatedPayRequest, transaction };
    });

    res.json({
      success: true,
      data: {
        payRequest: result.updatedPayRequest,
        transaction: result.transaction,
      },
      message: "Pay request approved. Payment processing in background.",
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/reject", requireUserType(UserType.CONSUMER), async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const payRequest = await prisma.payRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!payRequest) {
      throw new AppError("Pay request not found", 404);
    }

    if (payRequest.consumerId !== req.user.userId) {
      throw new AppError("Access denied", 403);
    }

    if (payRequest.status !== PayRequestStatus.PENDING) {
      throw new AppError(`Pay request already ${payRequest.status.toLowerCase()}`, 400);
    }

    const updatedPayRequest = await prisma.payRequest.update({
      where: { id: req.params.id },
      data: { status: PayRequestStatus.REJECTED },
      include: {
        merchant: { select: { email: true, userType: true } },
        consumer: { select: { email: true, userType: true } },
      },
    });

    res.json({
      success: true,
      data: { payRequest: updatedPayRequest },
      message: "Pay request rejected",
    });
  } catch (error) {
    next(error);
  }
});

export default router;

