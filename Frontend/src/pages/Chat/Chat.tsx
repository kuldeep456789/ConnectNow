import { useState } from "react";
import { useParams } from "react-router-dom";

import { useDocumentQuery, useCollectionQuery } from "../../hooks";

import { ConversationInfoType, ReplyInfoType } from "../../library";
import { useTheme, useUserStore } from "../../hooks";
import { Grow } from "@mui/material";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { Wrapper, MobileHide, ChatWrapper, Text } from "./Style";
import { Spinner } from "../../components/Core";
import { ChatHeader, ChatInputSection, ChatView } from "../../components/Chat";

export default function Chat() {
  const { id } = useParams();
  const { data, loading, error } = useDocumentQuery(
    `conversation-${id}`,
    `/conversations/${id}`
  );

  const conversation = data?.data() as ConversationInfoType;
  const { theme } = useTheme();
  const { currentUser } = useUserStore();
  const [replyInfo, setReplyInfo] = useState<ReplyInfoType | null>(null);

  // Fallback for conversation check if structure mismatches
  const hasAccess = conversation?.users?.includes(currentUser?.uid as string);

  const { data: messagesList, loading: msgLoading, error: msgError, refetch: refetchMessages } = useCollectionQuery(
    `conversation-messages-${id}`,
    `/messages/${id}`
  );

  return (
    <Wrapper theme={theme}>
      <MobileHide>
        <Sidebar />
      </MobileHide>
      <ChatWrapper>
        {loading ? (
          <Grow in={loading}>
            <div>
              <Spinner />
            </div>
          </Grow>
        ) : !conversation || error || !hasAccess ? (
          <Text theme={theme}>Conversation does not exist.</Text>
        ) : (
          <>
            <ChatHeader conversation={conversation} />
            <ChatView
              replyInfo={replyInfo}
              setReplyInfo={setReplyInfo}
              conversation={conversation}
              conversationId={id}
              messages={messagesList}
              loading={msgLoading}
              error={msgError}
            />
            <ChatInputSection
              replyInfo={replyInfo}
              setReplyInfo={setReplyInfo}
              conversationId={id}
              refetch={refetchMessages}
            />
          </>
        )}
      </ChatWrapper>
    </Wrapper>
  );
}
