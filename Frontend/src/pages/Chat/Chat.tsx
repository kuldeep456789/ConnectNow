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
import { VideoCallWindow } from "../../components/Chat/VideoCall/VideoCallWindow";
import { socketService } from "../../services/socket";
import { useEffect } from "react";

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

  
  const hasAccess = conversation?.users?.includes(currentUser?.uid as string);

  const { data: messagesList, loading: msgLoading, error: msgError, refetch: refetchMessages } = useCollectionQuery(
    `conversation-messages-${id}`,
    `/messages/${id}`
  );

  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  useEffect(() => {
    const socket = socketService.getSocket();
    socket.emit("join-room", { room: id });

    const handleIncomingSignal = (data: any) => {
      if (data.signal.type === "offer") {
        setIsVideoCallOpen(true);
      }
    };

    const handleNewMessage = (data: any) => {
      if (data.conversationId.toString() === id?.toString()) {
        refetchMessages();
      }
    };

    socket.on("signal", handleIncomingSignal);
    socket.on("new-message", handleNewMessage);

    return () => {
      socket.off("signal", handleIncomingSignal);
      socket.off("new-message", handleNewMessage);
    };
  }, [id]);

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
            <ChatHeader
              conversation={conversation}
              onStartVideoCall={() => setIsVideoCallOpen(true)}
            />
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

            {isVideoCallOpen && id && (
              <VideoCallWindow
                room={id}
                onClose={() => setIsVideoCallOpen(false)}
              />
            )}
          </>
        )}
      </ChatWrapper>
    </Wrapper>
  );
}
