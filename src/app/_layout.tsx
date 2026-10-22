import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { Text } from 'react-native';

import { contentAsset, contentDbName, dropOldContentDb, progressDb } from '@/data/db';
import migrations from '@/data/progress-migrations/migrations';

export default function RootLayout() {
  const { success, error } = useMigrations(progressDb, migrations);
  if (error) return <Text>Chyba databáze: {error.message}</Text>;
  if (!success) return null;
  return (
    <SQLiteProvider databaseName={contentDbName} assetSource={{ assetId: contentAsset }} onInit={dropOldContentDb}>
      <Stack />
    </SQLiteProvider>
  );
}
