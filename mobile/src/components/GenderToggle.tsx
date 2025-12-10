// src/components/GenderToggle.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";

export type Gender = "male" | "female";

interface Props {
  value: Gender | null;
  onChange: (g: Gender) => void;
}

const GenderToggle: React.FC<Props> = ({ value, onChange }) => {
  return (
    <View className="mt-1 flex-row gap-3">
      <Chip
        label="Male"
        selected={value === "male"}
        onPress={() => onChange("male")}
      />
      <Chip
        label="Female"
        selected={value === "female"}
        onPress={() => onChange("female")}
      />
    </View>
  );
};

const Chip = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-1 items-center rounded-full border px-3 py-2.5 ${
      selected ? "border-primary bg-primary" : "border-gray-200 bg-white"
    }`}
  >
    <Text
      className={`text-[14px] font-medium ${
        selected ? "text-white" : "text-text"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

export default GenderToggle;
