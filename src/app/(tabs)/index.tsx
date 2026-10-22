import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { characters, words } from '@/data/content-schema';
import { useContentDb } from '@/data/db';

export default function Today() {
  const db = useContentDb();
  const all = useMemo(() => db.select().from(words).all(), [db]);
  const chars = useMemo(() => db.select().from(characters).all(), [db]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Obsah HSK 1</Text>
      <Text style={styles.line}>
        Překlady: {all.filter((w) => w.gloss_cs).length} / {all.length}
      </Text>
      <Text style={styles.line}>
        Zkontrolovaná slova: {all.filter((w) => w.review_status === 'reviewed').length} / {all.length}
      </Text>
      <Text style={styles.line}>
        Poznámky ke znakům: {chars.filter((c) => c.note_cs).length} / {chars.length}
      </Text>
      <Text style={styles.later}>Opakování přibude v další verzi.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    gap: 8,
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  line: {
    fontSize: 16,
  },
  later: {
    marginTop: 24,
    fontSize: 14,
    color: '#666',
  },
});
