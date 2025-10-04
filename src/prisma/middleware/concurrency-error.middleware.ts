import { Prisma } from '@prisma/client';

// Define MiddlewareParams manually (since Prisma 5 removed the type)
type MiddlewareParams = {
  model?: string;
  action: Prisma.PrismaAction;
  args: any;
  dataPath: string[];
  runInTransaction: boolean;
};

// Define a generic Middleware type
type Middleware<T = any> = (
  params: MiddlewareParams,
  next: (params: MiddlewareParams) => Promise<T>,
) => Promise<T>;

// ✅ Updated middleware
export const ConcurrencyErrorMiddleware: Middleware = async (params, next) => {
  const result = await next(params);

  if (
    (params.action === 'updateMany' || params.action === 'deleteMany') &&
    params.args?.where?.version &&
    result?.count === 0
  ) {
    throw new Error('Concurrency conflict: Something went wrong');
  }

  return result;
};
