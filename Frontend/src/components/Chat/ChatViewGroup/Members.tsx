import { useUserStore, useUsersInfo } from "../../../hooks";
import {
  ConversationInfoType,
  IMAGE_PROXY,
  SavedUserType,
} from "../../../library";
import { Spinner } from "../../Core";
import toast from "react-hot-toast";
import { UserProfilePicture } from "../../Sidebar/CreateConversation/Style";
import {
  KickGroupButton,
  LeaveGroupButton,
  MakeAdminButton,
  MemberContainer,
  MemberItem,
  MemberWrapper,
  MembersButtons,
} from "./Style";

type MembersProps = {
  theme: string;
  conversation: ConversationInfoType;
};

export const Members = ({ conversation, theme }: MembersProps) => {
  // const { id: conversationId } = useParams();

  const currentUser = useUserStore((state) => state.currentUser);

  const { data, loading, error } = useUsersInfo(conversation.users);

  // const navigate = useNavigate();

  const handleRemoveFromGroup = (_uid: string) => {
    toast.error("Remove from group not implemented in MVP");
  };

  const handleMakeAdmin = (_uid: string) => {
    toast.error("Make admin not implemented in MVP");
  };

  if (loading || error) return <Spinner />;

  return (
    <div>
      <MemberContainer>
        {data
          ?.map((item) => item.data() as SavedUserType)
          .map((user) => (
            <MemberWrapper key={user.uid}>
              <MemberItem theme={theme}>
                <UserProfilePicture src={IMAGE_PROXY(user.photoURL)} alt="" />
                <p>{user.displayName}</p>
              </MemberItem>

              {conversation.group?.admins?.includes(
                currentUser?.uid as string
              ) && (
                  <MembersButtons theme={theme}>
                    {conversation.users.length > 3 &&
                      (user.uid === currentUser?.uid ? (
                        <LeaveGroupButton
                          theme={theme}
                          onClick={() => handleRemoveFromGroup(user.uid)}
                        >
                          Leave group
                        </LeaveGroupButton>
                      ) : (
                        <KickGroupButton
                          theme={theme}
                          onClick={() => handleRemoveFromGroup(user.uid)}
                        >
                          Kick from group
                        </KickGroupButton>
                      ))}
                    {user.uid !== currentUser?.uid && (
                      <MakeAdminButton
                        theme={theme}
                        onClick={() => handleMakeAdmin(user.uid)}
                      >
                        Make an admin
                      </MakeAdminButton>
                    )}
                  </MembersButtons>
                )}
            </MemberWrapper>
          ))}
      </MemberContainer>
    </div>
  );
};
