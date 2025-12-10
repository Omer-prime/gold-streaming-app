// src/components/TextField.tsx
import React from "react";
import { View, TextInput, Text, TextInputProps } from "react-native";

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

const TextField: React.FC<Props> = ({ label, error, className, ...rest }) => {
  return (
    <View className="mb-3">
      {label && (
        <Text className="mb-1 text-[13px] text-muted">{label}</Text>
      )}
      <TextInput
        className={`rounded-xl bg-[#F7F7FA] px-3.5 py-3 text-[14px] text-text ${
          error ? "border border-red-500" : ""
        } ${className ?? ""}`}
        placeholderTextColor="#9CA3AF"
        {...rest}
      />
      {error && <Text className="mt-1 text-[11px] text-red-500">{error}</Text>}
    </View>
  );
};

export default TextField;
