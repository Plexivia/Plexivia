import { Schema } from 'mongoose';

/**
 * Dashboard-wide soft delete: records are never removed, only marked `is_active: false`.
 *
 * - Adds `is_active` (default true) and `deleted_at` to every schema.
 * - Read/update queries hide inactive records automatically. Records saved before this
 *   plugin have no `is_active` field and stay visible (`$ne: false`).
 * - Pass `{ withInactive: true }` as a query option (or filter on `is_active` yourself)
 *   to see inactive records.
 * - Schemas that already define `is_active` with their own meaning (e.g. Admin accounts,
 *   where inactive = disabled login but still listed) keep their field and are not filtered.
 */
const FILTERED_QUERIES = [
  'countDocuments',
  'distinct',
  'find',
  'findOne',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
  'updateOne',
  'updateMany',
] as const;

export const softDeletePlugin = (schema: Schema) => {
  const ownsActiveFlag = !!schema.path('is_active');

  if (!schema.path('deleted_at')) schema.add({ deleted_at: { type: String } });
  if (ownsActiveFlag) return;

  schema.add({ is_active: { type: Boolean, default: true, index: true } });

  schema.pre(FILTERED_QUERIES as any, function (this: any) {
    if (this.getOptions?.().withInactive) return;
    const filter = this.getFilter();
    if (filter && Object.prototype.hasOwnProperty.call(filter, 'is_active')) return;
    this.where({ is_active: { $ne: false } });
  });

  schema.pre('aggregate', function (this: any) {
    if (this.options?.withInactive) return;
    const pipeline = this.pipeline();
    const first = pipeline[0];
    // $geoNear / $search etc. must stay first; only prepend in front of ordinary stages
    if (first && ('$geoNear' in first || '$search' in first || '$vectorSearch' in first)) return;
    pipeline.unshift({ $match: { is_active: { $ne: false } } });
  });
};

// Soft-deletes the documents matching `filter`; returns the (now inactive) document, or null if none matched
export const softDeleteOne = (model: any, filter: Record<string, any>) =>
  model.findOneAndUpdate(filter, { $set: { is_active: false, deleted_at: new Date().toISOString() } }, { new: true });

export const softDeleteMany = (model: any, filter: Record<string, any>) =>
  model.updateMany(filter, { $set: { is_active: false, deleted_at: new Date().toISOString() } });
