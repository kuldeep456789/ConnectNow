import { useUserStore, useUsersInfo } from "../../../hooks";
import {
  ConversationInfoType,
  IMAGE_PROXY,
  SavedUserType,
} from "../../../library";

import { Spinner } from "../../Core";
import toast from "react-hot-toast";
import {
  AdminBadge,
  MemberContainer,
  MemberItem,
  MemberWrapper,
  RemooveAdminButton,
} from "./Style";
import { UserProfilePicture } from "../../Sidebar/CreateConversation/Style";

type AdminProps = {
  theme: string;
  conversation: ConversationInfoType;
};
export function Admin({ conversation, theme }: AdminProps) {
  // const { id: conversationId } = useParams();

  const currentUser = useUserStore((state) => state.currentUser);

  const { data, loading, error } = useUsersInfo(
    conversation.group?.admins as string[]
  );

  const handleRemoveAdminPosition = (_uid: string) => {
    toast.error("Remove admin not implemented in MVP");
  };

  if (loading || error) return <Spinner />;
  return (
    <MemberContainer>
      {data
        ?.map((item) => item.data() as SavedUserType)
        .map((user) => (
          <MemberWrapper key={user.uid}>
            <MemberItem theme={theme}>
              <UserProfilePicture src={IMAGE_PROXY(user.photoURL)} alt="" />
              <p>{user.displayName}</p>
            </MemberItem>

            {conversation.group?.admins?.includes(currentUser?.uid as string) &&
              user.uid !== currentUser?.uid ? (
              <RemooveAdminButton
                onClick={() => handleRemoveAdminPosition(user.uid)}
              >
                Remove admin position
              </RemooveAdminButton>
            ) : (
              <AdminBadge>Admin</AdminBadge>
            )}
          </MemberWrapper>
        ))}
    </MemberContainer>
  );
}
