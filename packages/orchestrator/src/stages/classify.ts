import { classifyBatch } from '@maps/core/classify';
import type { StageResult } from '@maps/core';

/** CLI wrapper around the shared classify batch. */
export async function runClassify(limit = 500): Promise<StageResult> {
  return classifyBatch(limit);
}
