import { Router } from "express";
import { prisma } from "@paynxt/database";
import { requireAuth } from "../middleware/auth";
import { AppError } from "../middleware/error-handler";
import { formatCurrency } from "@paynxt/ui";

const router = Router();

router.use(requireAuth);

router.get("/profile", async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        userType: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/balance", async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { balance: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json({
      success: true,
      data: {
        balance: user.balance,
        formattedBalance: formatCurrency(user.balance),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

