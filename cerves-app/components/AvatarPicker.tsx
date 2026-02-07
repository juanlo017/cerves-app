import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

const AVATARS = ["AV_01","AV_02","AV_03","AV_04","AV_05","AV_06","AV_07","AV_08"];

export function AvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {AVATARS.map((k) => (
        <Pressable
          key={k}
          onPress={() => onChange(k)}
          style={[styles.cell, value === k && styles.selected]}
        >
          <Text style={styles.text}>{k}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: {
    borderWidth: 2,
    borderColor: "#2a3b78",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#0e1630",
  },
  selected: { borderColor: "#7CFF6B" },
  text: { color: "#9bb0d0" },
});
