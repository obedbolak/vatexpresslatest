import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="signup"
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack>
  );
};
export default _layout;
