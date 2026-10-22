import { StyleSheet, Text, View } from 'react-native';

export default function Progress() {
  return (
    <View style={styles.screen}>
      <Text style={styles.later}>Tvůj pokrok tu bude, až začneš opakovat.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  later: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
