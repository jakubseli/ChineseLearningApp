import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { WordRow } from '@/components/word-row';
import { words } from '@/data/content-schema';
import { useContentDb } from '@/data/db';
import { wordMatches } from '@/domain/search';

export default function Words() {
  const db = useContentDb();
  const all = useMemo(() => db.select().from(words).orderBy(words.seq).all(), [db]);
  const [query, setQuery] = useState('');
  const [draftsOnly, setDraftsOnly] = useState(false);
  const drafts = all.filter((w) => w.review_status === 'draft').length;
  const shown = all.filter((w) => (!draftsOnly || w.review_status === 'draft') && wordMatches(w, query));

  return (
    <View style={styles.screen}>
      <TextInput
        style={styles.search}
        placeholder="hanzi, pinyin, česky"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.filters}>
        <Filter label={`Vše ${all.length}`} active={!draftsOnly} onPress={() => setDraftsOnly(false)} />
        <Filter label={`Koncept ${drafts}`} active={draftsOnly} onPress={() => setDraftsOnly(true)} />
      </View>
      <FlatList data={shown} keyExtractor={(w) => w.id} keyboardShouldPersistTaps="handled" renderItem={({ item }) => <WordRow {...item} />} />
    </View>
  );
}

function Filter({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.filter, active && styles.filterActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Text style={active ? styles.filterActiveText : styles.filterText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  search: {
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 8,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
  filterActive: {
    backgroundColor: '#E6F1FB',
    borderColor: '#185FA5',
  },
  filterText: {
    color: '#666',
  },
  filterActiveText: {
    color: '#0C447C',
  },
});
