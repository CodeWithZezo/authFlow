// ==================== src/types/express.types.ts ====================
import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
  userId?: Types.ObjectId;
  sessionId?: Types.ObjectId;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}