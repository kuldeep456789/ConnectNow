import { Fragment, useEffect, useRef } from "react";

import { useTheme, useUserStore } from "../../../hooks";
import { Grow, Text, StylesChatView } from "./Style";
import {
  ConversationInfoType,
  ReplyInfoType,
} from "../../../library";
import { Spinner } from "../../Core";
import { ChatRightMessage, LeftMessage } from "..";

type ChatViewProps = {
  conversation: ConversationInfoType;
  replyInfo: ReplyInfoType | null;
  setReplyInfo: (value: ReplyInfoType | null) => void;
  conversationId?: string;
  messages: any[];
  loading: boolean;
  error: boolean;
};

export function ChatView({
  conversation,
  replyInfo,
  setReplyInfo,
  messages: data,
  loading,
  error,
}: ChatViewProps) {
  const { currentUser } = useUserStore();
  const { theme } = useTheme();
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const isWindowFocus = useRef(true);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollBottomRef.current) {
      scrollBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data]);

  useEffect(() => {
    const focusHandler = () => {
      isWindowFocus.current = true;
      // Mark seen logic here if implemented on backend
    };

    const blurHandler = () => {
      isWindowFocus.current = false;
    };

    window.addEventListener("focus", focusHandler);
    window.addEventListener("blur", blurHandler);

    return () => {
      window.removeEventListener("focus", focusHandler);
      window.removeEventListener("blur", blurHandler);
    };
  }, []);

  if (loading)
    return (
      <Grow>
        <Spinner />
      </Grow>
    );

  if (error)
    return (
      <Grow>
        <Text theme={theme}>Something went wrong</Text>
      </Grow>
    );

  if (!data || data.length === 0)
    return (
      <Grow>
        <Text theme={theme}>No message recently. Start chatting now.</Text>
      </Grow>
    );

  return (
    <StylesChatView theme={theme}>
      {data.map((item: any, index: number) => {
        // Normalize item structure from backend to what components expect
        const message = {
          id: item.id,
          sender: item.senderId,
          content: item.content,
          type: item.type,
          createdAt: { seconds: new Date(item.createdAt).getTime() / 1000, nanoseconds: 0 },
          reactions: item.reactions || {},
          replyTo: item.replyTo,
          file: item.file
        };

        return (
          <Fragment key={item.id}>
            {message.sender === currentUser?.uid ? (
              <ChatRightMessage
                replyInfo={replyInfo}
                setReplyInfo={setReplyInfo}
                message={message}
              />
            ) : (
              <LeftMessage
                replyInfo={replyInfo}
                setReplyInfo={setReplyInfo}
                message={message}
                index={index}
                docs={data} // Passing full array instead of docs
                conversation={conversation}
              />
            )}
            {/* Seen status visualization removed for MVP as backend doesn't support it yet */}
          </Fragment>
        )
      })}
      <div ref={scrollBottomRef} />
    </StylesChatView>
  );
}
