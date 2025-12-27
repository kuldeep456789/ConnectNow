import { useTheme } from "../../hooks";
import { HomeWrapper, Text } from "./Style";

export default function Home() {
  const { theme } = useTheme();
  return (
    <HomeWrapper theme={theme}>
      <Text theme={theme}>Conversation to start chatting.</Text>
    </HomeWrapper>
  );
}
