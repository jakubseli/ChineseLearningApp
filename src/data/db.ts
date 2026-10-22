import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { Asset } from 'expo-asset';
import { deleteDatabaseAsync, openDatabaseSync, useSQLiteContext } from 'expo-sqlite';
import { useMemo } from 'react';

import { settings } from './progress-schema';

export const progressDb = drizzle(openDatabaseSync('progress.db', { enableChangeListener: true }));

export const contentAsset = require('../../content/build/content.db');
export const contentDbName = `content_${Asset.fromModule(contentAsset).hash}.db`;

export async function dropOldContentDb(): Promise<void> {
  const [old] = await progressDb.select().from(settings).where(eq(settings.key, 'content_db'));
  if (old?.value === contentDbName) return;
  if (old) await deleteDatabaseAsync(old.value).catch(() => {});
  await progressDb
    .insert(settings)
    .values({ key: 'content_db', value: contentDbName })
    .onConflictDoUpdate({ target: settings.key, set: { value: contentDbName } });
}

export function useContentDb() {
  const db = useSQLiteContext();
  return useMemo(() => drizzle(db), [db]);
}
