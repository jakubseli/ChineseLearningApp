import { count, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Link } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { words } from '@/data/content-schema';
import { contentDbName, progressDb, useContentDb } from '@/data/db';
import { cards } from '@/data/progress-schema';
import { introduce } from '@/domain/cards';
import { studyDay } from '@/domain/habit';

const SAMPLE = '写这说学生';
const TEST_ITEM = 'w:test:1';

async function toggleTestCard() {
  const deleted = await progressDb.delete(cards).where(eq(cards.item_id, TEST_ITEM)).returning();
  if (deleted.length) return;
  const now = new Date();
  const [{ card }] = introduce(TEST_ITEM, false, studyDay(now), now);
  await progressDb.insert(cards).values({ id: card.id, item_id: card.itemId, kind: card.kind, introduced_on: card.introducedOn, ...card.fsrs });
}

export default function Index() {
  const content = useContentDb();
  const [wordCount, setWordCount] = useState<number>();
  useEffect(() => {
    content
      .select({ n: count() })
      .from(words)
      .then(([row]) => setWordCount(row.n));
  }, [content]);
  const { data } = useLiveQuery(progressDb.select({ n: count() }).from(cards));

  return (
    <View style={styles.container}>
      <Text style={[styles.hanzi, { fontFamily: 'noto_sans_sc' }]}>{SAMPLE}</Text>
      <Text style={styles.hanzi}>{SAMPLE}</Text>
      <Text>Nahoře Noto Sans SC, dole systémové písmo</Text>
      <Text style={[styles.latin, { fontFamily: 'noto_sans_sc' }]}>Rag xuéshēng 0123</Text>
      <Text style={styles.latin}>Rag xuéshēng 0123</Text>
      <Text>content.db: {wordCount ?? '…'} slov</Text>
      <Text style={styles.small}>{contentDbName}</Text>
      <Text>progress.db: {data[0]?.n ?? '…'} karet</Text>
      <Button title="Přidat / smazat testovací kartu" onPress={toggleTestCard} />
      <Button title="🔊 Přečíst" onPress={() => Speech.speak(SAMPLE, { language: 'zh-CN' })} />
      <Link href="/spike" style={styles.link}>
        Spike testy →
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  hanzi: {
    fontSize: 40,
  },
  latin: {
    fontSize: 28,
  },
  small: {
    fontSize: 12,
    color: '#666',
  },
  link: {
    marginTop: 24,
    fontSize: 18,
    color: '#208AEF',
  },
});
