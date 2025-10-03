import { ArrayHelper } from '../../common/helper/array.helper';
import { DateHelper } from '../../common/helper/date.helper';

const models = ['Note'];

/**
 * Prisma Soft delete middleware
 */
export async function SoftdeleteMiddleware(params, next) {
  const date = DateHelper.now();

  if (ArrayHelper.inArray(params.model, models)) {
    // findUnique & findFirst
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where['deleted_at'] = null;
    }

    // findMany
    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deleted_at === undefined) {
          params.args.where['deleted_at'] = null;
        }
      } else {
        params.args['where'] = { deleted_at: null };
      }
    }

    // update
    if (params.action === 'update') {
      params.action = 'updateMany';
      params.args.where['deleted_at'] = null;
    }

    // updateMany
    if (params.action === 'updateMany') {
      if (params.args.where != undefined) {
        params.args.where['deleted_at'] = null;
      } else {
        params.args['where'] = { deleted_at: null };
      }
    }

    // delete → soft delete
    if (params.action === 'delete') {
      params.action = 'update';
      params.args['data'] = { deleted_at: date };
    }

    // deleteMany → soft delete
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deleted_at'] = date;
      } else {
        params.args['data'] = { deleted_at: date };
      }
    }
  }

  return next(params);
}
