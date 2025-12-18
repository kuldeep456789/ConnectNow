import {
  ConversationInfoType,
  IMAGE_PROXY,
  SavedUserType,
} from "../../../library";
import { Spinner } from "../../Core";

import {
  AddMemberButton,
  Info,
  MemberContainer,
  MemberItem,
  MemberWrapper,
} from "./Style";
import { UserProfilePicture } from "../../Sidebar/CreateConversation/Style";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import toast from "react-hot-toast";

type AddMembersProps = {
  theme: string;
  conversations: ConversationInfoType;
};

export function AddMembers({ conversations, theme }: AddMembersProps) {
  
  const [data, setData] = useState<{ docs: any[], empty: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        
        const res = await api.get('/users/search?q=');
        const allUsers = res.data;
        const existingUids = new Set(conversations.users);
        const availableUsers = allUsers.filter((u: any) => !existingUids.has(u.uid));

        setData({
          docs: availableUsers.map((u: any) => ({ data: () => u })), 
          empty: availableUsers.length === 0
        });
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError(true);
        setLoading(false);
      }
    }
    fetchUsers();
  }, [conversations.users]);


  const handleAddMember = (_uid: string) => {
    toast.error("Add member not implemented in MVP");
  };

  if (loading || error) return <Spinner />;

  return (
    <MemberContainer>
      {data?.docs
        ?.map((item) => item.data() as SavedUserType)
        .map((user) => (
          <MemberWrapper key={user.uid}>
            <MemberItem theme={theme}>
              <UserProfilePicture
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                src={IMAGE_PROXY(user.photoURL)}
                alt=""
              />
              <p>{user.displayName}</p>
            </MemberItem>
            <AddMemberButton onClick={() => handleAddMember(user.uid)}>
              Add participants
            </AddMemberButton>
          </MemberWrapper>
        ))}
      {data?.empty && <Info theme={theme}>No more user to add</Info>}
    </MemberContainer>
  );
}
