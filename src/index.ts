import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (apiKey === process.env.VALID_API_KEY) {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Invalid or missing API key' });
  }
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Users API");
});

app.get('/api/v1/users', checkApiKey, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: skip,
      take: limit,
      select: {
        id: true,
        type: true,
        startup: true,
        business: true,
        preferences: true,
        password: false,
        image: false,
        emailVerified: false,
        email: false,
        phoneNumber: false,
        createdAt: false,
        updatedAt: false,
      }
    });

    const totalUsers = await prisma.user.count();

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      page,
      totalPages,
      totalUsers,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

app.get('/api/v1/users/:id', checkApiKey, async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        type: true,
        startup: true,
        business: true,
        preferences: true,
        password: false,
        image: false,
        emailVerified: false,
        email: false,
        phoneNumber: false,
        createdAt: false,
        updatedAt: false,
      }
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
