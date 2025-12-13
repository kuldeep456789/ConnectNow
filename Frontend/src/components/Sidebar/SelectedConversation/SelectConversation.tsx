import { Skeleton } from "@mui/material";
import { Link, useParams } from "react-router-dom";

import { useUserStore, useUsersInfo } from "../../../hooks";
import { ConversationInfoType, IMAGE_PROXY } from "../../../library";
import {
  Flex,
  Name,
  LastMessage,
  Relative,
  ImagePrimary,
  ImageSecondary,
  Image,
  MessageInfo,
  TopRow,
  Timestamp,
  OnlineIndicator,
  MessageStatus,
  AvatarWrapper,
} from "./Style";

type SelectConversationProps = {
  theme: string | null;
  conversation: ConversationInfoType;
  conversationId: string;
  collapsed?: boolean;
};

export function SelectConversation({
  theme,
  conversation,
  conversationId,
  collapsed,
}: SelectConversationProps) {
  const { data: users, loading } = useUsersInfo(conversation.users);
  const currentUser = useUserStore((state) => state.currentUser);

  const filtered = users?.filter((user: any) => user.id !== currentUser?.uid);
  const { id } = useParams();

  if (loading && theme)
    return (
      <Flex theme={theme}>
        <Skeleton variant="circular" width={65} height={65} sx={{ mr: 1.5 }} />
        <div>
          <Skeleton
            width={100}
            height={15}
            sx={{ mb: 1 }}
            variant="rectangular"
          />
          <Skeleton variant="rectangular" width={140} height={15} />
        </div>
      </Flex>
    );

  // Format last message for display
  const formatLastMessage = () => {
    if (!conversation.lastMessage) return "No messages yet";

    const msg = conversation.lastMessage;

    // Check if it's an image URL
    if (msg.includes("/uploads/") && (msg.includes(".jpg") || msg.includes(".png") || msg.includes(".jpeg") || msg.includes(".gif"))) {
      return "📷 Photo";
    }

    // Check if it's a file URL
    if (msg.includes("/uploads/")) {
      return "📎 File";
    }

    // Truncate text messages
    return msg.length > 35 ? msg.slice(0, 35) + "..." : msg;
  };

  // Format timestamp
  const formatTimestamp = () => {
    if (!conversation.updatedAt) return "";

    const msgDate = new Date(conversation.updatedAt.seconds * 1000);
    const now = new Date();
    const diffMs = now.getTime() - msgDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return msgDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return msgDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return msgDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Duo Conversation
  if (conversation.users?.length === 2 && theme)
    return (
      <Link to={`/${conversationId}`} style={{ textDecoration: "none" }}>
        <Flex
          theme={theme}
          className={conversationId === id ? "active" : "not-active"}
        >
          <AvatarWrapper>
            <Image src={IMAGE_PROXY(filtered?.[0]?.data()?.photoURL)} alt="" />
            <OnlineIndicator theme={theme} />
          </AvatarWrapper>
          {!collapsed && (
            <MessageInfo>
              <TopRow>
                <Name theme={theme}>{filtered?.[0].data()?.displayName}</Name>
                <Timestamp theme={theme}>{formatTimestamp()}</Timestamp>
              </TopRow>
              <LastMessage theme={theme}>
                <MessageStatus>✓✓</MessageStatus>
                {formatLastMessage()}
              </LastMessage>
            </MessageInfo>
          )}
        </Flex>
      </Link>
    );

  // Group Conversation
  return (
    <Link to={`/${conversationId}`} style={{ textDecoration: "none" }}>
      {theme && (
        <Flex
          theme={theme}
          className={conversationId === id ? "active" : "not-active"}
        >
          {conversation?.group?.groupImage ? (
            <Image src={conversation.group.groupImage} alt="" />
          ) : (
            <Relative>
              <ImagePrimary
                className={
                  conversationId === id ? "not-active-border" : "active-border"
                }
                src={IMAGE_PROXY(filtered?.[0]?.data()?.photoURL)}
                alt=""
              />
              <ImageSecondary
                src={IMAGE_PROXY(filtered?.[1]?.data()?.photoURL)}
                alt=""
              />
            </Relative>
          )}
          {!collapsed && (
            <MessageInfo>
              <TopRow>
                <Name theme={theme}>
                  {conversation?.group?.groupName ||
                    filtered
                      ?.map((user: any) => user.data()?.displayName)
                      .slice(0, 3)
                      .join(", ")}
                </Name>
                <Timestamp theme={theme}>{formatTimestamp()}</Timestamp>
              </TopRow>
              <LastMessage theme={theme}>{formatLastMessage()}</LastMessage>
            </MessageInfo>
          )}
        </Flex>
      )}
    </Link>
  );
}
