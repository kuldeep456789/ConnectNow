import { Skeleton } from "@mui/material";
import { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { MdGroups, MdInfo } from "react-icons/md";
import { LuVideo } from "react-icons/lu";

import { useTheme, useUserStore, useUsersInfo } from "../../../hooks";
import { ConversationInfoType, IMAGE_PROXY } from "../../../library";

import { ViewMedia } from "../../Media/ViewMedia";
import {
  Header,
  Wrapper,
  Name,
  Email,
  GroupButton,
  SettingButton,
  VideoButton,
  HomeLink,
} from "./Style";
import { ChatViewGroup } from "../ChatViewGroup/ChatViewGroup";
import { ChatConversationSettings } from "..";
import { Avatar } from "../../Shared";

type ChatHeaderProps = {
  conversation: ConversationInfoType;
  onStartVideoCall?: () => void;
};
export function ChatHeader({ conversation, onStartVideoCall }: ChatHeaderProps) {
  const { data: users, loading } = useUsersInfo(conversation.users);
  const { currentUser } = useUserStore();
  const { theme } = useTheme();
  const filtered = users?.filter((user) => user.id !== currentUser?.uid);

  const [isConversationSettingsOpen, setIsConversationSettingsOpen] =
    useState(false);

  const [isGroupMembersOpen, setIsGroupMembersOpen] = useState(false);
  const [isViewMediaOpen, setIsViewMediaOpen] = useState(false);

  return (
    <>
      <Header theme={theme}>
        <Wrapper>
          <HomeLink
            theme={theme}
            className="mobile__link"
            to="/"
            aria-label="Home"
          >
            <FaChevronLeft />
          </HomeLink>

          {loading ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <>
              {conversation.users.length === 2 ? (
                <Avatar
                  src={filtered?.[0]?.data()?.photoURL ? IMAGE_PROXY(filtered?.[0]?.data()?.photoURL) : null}
                  name={filtered?.[0]?.data()?.displayName || filtered?.[0]?.data()?.email || filtered?.[0]?.id || "?"}
                  size="40px"
                />
              ) : (
                <>
                  {conversation?.group?.groupImage ? (
                    <Avatar
                      src={conversation.group.groupImage}
                      name={conversation.group.groupName || "Group"}
                      size="40px"
                    />
                  ) : (
                    <Avatar
                      src={null}
                      name={
                        conversation?.group?.groupName ||
                        filtered?.map((user) => user.data()?.displayName || user.data()?.email).join(", ") ||
                        users?.map((user) => user.data?.()?.displayName || user.data?.()?.email || user.id).join(", ") ||
                        "?"
                      }
                      size="40px"
                    />
                  )}
                </>
              )}
            </>
          )}

          {loading ? (
            <Skeleton
              width={100}
              height={15}
              variant="rectangular"
              sx={{ ml: "10px" }}
            />
          ) : (
            <div>
              <Name theme={theme}>
                {conversation.users.length > 2 && conversation?.group?.groupName
                  ? conversation.group.groupName
                  : filtered
                    ?.map((user) => user.data()?.displayName)
                    .slice(0, 3)
                    .join(", ")}
              </Name>
              {conversation.users.length === 2 && filtered?.[0]?.data()?.email && (
                <Email theme={theme}>{filtered[0].data()?.email}</Email>
              )}
            </div>
          )}
        </Wrapper>

        {!loading && (
          <Wrapper>
            {conversation.users.length > 2 && (
              <GroupButton
                theme={theme}
                onClick={() => setIsGroupMembersOpen(true)}
              >
                <MdGroups />
              </GroupButton>
            )}

            <VideoButton
              theme={theme}
              onClick={onStartVideoCall}
              title="Start Video Call"
            >
              <LuVideo />
            </VideoButton>

            <SettingButton
              theme={theme}
              onClick={() => setIsConversationSettingsOpen(true)}
            >
              <MdInfo />
            </SettingButton>
          </Wrapper>
        )}
      </Header>

      {isConversationSettingsOpen && theme && (
        <ChatConversationSettings
          theme={theme}
          conversation={conversation}
          setMediaViewOpen={setIsViewMediaOpen}
          isOpen={isConversationSettingsOpen}
          setIsOpen={setIsConversationSettingsOpen}
        />
      )}

      {isGroupMembersOpen && theme && (
        <ChatViewGroup
          theme={theme}
          conversation={conversation}
          isOpen={isGroupMembersOpen}
          setIsOpen={setIsGroupMembersOpen}
        />
      )}

      {isViewMediaOpen && theme && (
        <ViewMedia
          theme={theme}
          setIsOpen={setIsViewMediaOpen}
          isOpen={isViewMediaOpen}
        />
      )}
    </>
  );
}
