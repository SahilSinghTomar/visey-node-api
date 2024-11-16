"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const checkApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === process.env.VALID_API_KEY) {
        next();
    }
    else {
        res.status(403).json({ error: 'Forbidden: Invalid or missing API key' });
    }
};
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
app.get('/api/v1/users', checkApiKey, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || DEFAULT_PAGE;
        const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
        const skip = (page - 1) * limit;
        const users = yield prisma.user.findMany({
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
        const totalUsers = yield prisma.user.count();
        const totalPages = Math.ceil(totalUsers / limit);
        res.json({
            page,
            totalPages,
            totalUsers,
            users,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
}));
app.get('/api/v1/users/:id', checkApiKey, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield prisma.user.findUnique({
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
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve data' });
    }
}));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
