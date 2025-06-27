import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, UserType } from "@paynxt/database";
import { registerSchema, loginSchema } from "@paynxt/types";
import { config } from "../config";
import { AppError } from "../middleware/error-handler";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        userType: validatedData.userType as UserType,
      },
      select: {
        id: true,
        email: true,
        userType: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
      },
      message: "Registration successful",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        userType: user.userType,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.userType,
          balance: user.balance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
