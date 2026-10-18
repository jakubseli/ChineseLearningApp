import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 48 }}>你好！</Text>
      <Text>Ahoj! Aplikace běží.</Text>
      <Link href="/spike" style={styles.link}>
        Spike testy →
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  link: {
    marginTop: 24,
    fontSize: 18,
    color: "#208AEF",
  },
});
