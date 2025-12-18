import { Skeleton } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";

import { useUserStore, useUsersInfo } from "../../../hooks";
import { ConversationInfoType, IMAGE_PROXY } from "../../../library";
import api from "../../../services/api";
import { Avatar } from "../../Shared";
import {
  Flex,
  Name,
  LastMessage,
  MessageInfo,
  TopRow,
  Timestamp,
  OnlineIndicator,
  MessageStatus,
  AvatarWrapper,
  DeleteButton,
} from "./Style";

type SelectConversationProps = {
  theme: string | null;
  conversation: ConversationInfoType;
  conversationId: string;
  collapsed?: boolean;
  onRefresh?: () => void;
};

export function SelectConversation({
  theme,
  conversation,
  conversationId,
  collapsed,
  onRefresh,
}: SelectConversationProps) {
  const { data: users, loading } = useUsersInfo(conversation.users);
  const currentUser = useUserStore((state) => state.currentUser);

  const filtered = users?.filter((user: any) => user.id !== currentUser?.uid);
  const { id } = useParams();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
      await api.delete(`/conversations/${conversationId}`);
      toast.success("Conversation deleted");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete conversation");
    }
  };

  if (loading && theme)
    return (
      <Flex theme={theme}>
        <Skeleton variant="circular" width={55} height={55} sx={{ mr: 1.5 }} />
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
            <Avatar
              src={filtered?.[0]?.data()?.photoURL ? IMAGE_PROXY(filtered?.[0]?.data()?.photoURL) : null}
              name={
                filtered?.[0]?.data()?.displayName ||
                filtered?.[0]?.data()?.email ||
                filtered?.[0]?.id ||
                conversation.users?.find((uid: string) => uid !== currentUser?.uid) ||
                currentUser?.displayName ||
                currentUser?.email ||
                "?"
              }
              size="55px"
              style={{ marginRight: "10px" }}
            />
            <OnlineIndicator theme={theme} />
          </AvatarWrapper>
          {!collapsed && (
            <>
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
              <DeleteButton className="delete-btn" onClick={handleDelete} title="Delete conversation">
                <LuTrash2 size={18} />
              </DeleteButton>
            </>
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
            <Avatar
              src={conversation.group.groupImage}
              name={conversation.group.groupName || "Group"}
              size="55px"
              style={{ marginRight: "10px" }}
            />
          ) : (
            <Avatar
              src={null}
              name={
                conversation?.group?.groupName ||
                filtered?.map((user: any) => user.data()?.displayName || user.data()?.email).join(", ") ||
                users?.map((user: any) => user.data?.()?.displayName || user.data?.()?.email).join(", ") ||
                "?"
              }
              size="55px"
              style={{ marginRight: "10px" }}
            />
          )}
          {!collapsed && (
            <>
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
              <DeleteButton className="delete-btn" onClick={handleDelete} title="Delete conversation">
                <LuTrash2 size={18} />
              </DeleteButton>
            </>
          )}
        </Flex>
      )}
    </Link>
  );
}
