import { StyleSheet, Text } from 'react-native';

export function DraftBadge({ status }: { status: 'draft' | 'reviewed' }) {
  return status === 'draft' ? <Text style={styles.badge}>koncept</Text> : null;
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 12,
    color: '#633806',
    backgroundColor: '#FAEEDA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
