import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useCollectionQuery, useUserStore } from "../../../hooks";
import { IMAGE_PROXY } from "../../../library";
import { Wrapper, Text } from "../Style";
import {
  ActionButton,
  CheckBox,
  UserButton,
  UserList,
  UserName,
  UserProfilePicture,
} from "./Style";
import { Modal, Spinner } from "../../Core";
import api from "../../../services/api";

type CreateConversationProps = {
  theme: string;
  isOpen: boolean;
  setConversationModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export function CreateConversation({
  theme,
  isOpen,
  setConversationModalOpen,
}: CreateConversationProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const { currentUser } = useUserStore();

  const { data, error, loading } = useCollectionQuery(
    "all-users",
    "/users/search"
  );

  const navigate = useNavigate();

  const handleToggle = (uid: string) => {
    // Single select for now
    if (selected.includes(uid)) {
      setSelected([]);
    } else {
      setSelected([uid]);
    }
  };

  const handleCreateConversation = async () => {
    if (selected.length === 0) return;
    setIsCreating(true);

    try {
      const response = await api.post("/conversations", {
        recipientUid: selected[0],
      });

      setConversationModalOpen(false);
      navigate(`/${response.data.conversationId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create conversation");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      theme={theme}
      isOpen={isOpen}
      onClose={() => setConversationModalOpen(false)}
      title="Create Conversation"
    >
      {loading ? (
        <Spinner />
      ) : error ? (
        <Text>Something went wrong</Text>
      ) : (
        <>
          {isCreating && <Spinner />}
          <UserList>
            {data
              ?.filter((user: any) => user.uid !== currentUser?.uid)
              .map((user: any) => (
                <UserButton
                  theme={theme}
                  key={user.uid}
                  onClick={() => handleToggle(user.uid)}
                >
                  <CheckBox
                    type="radio" // using radio for single select visual
                    style={{ cursor: "pointer" }}
                    checked={selected.includes(user.uid)}
                    readOnly
                  />
                  <UserProfilePicture
                    src={IMAGE_PROXY(user.photoURL)}
                    alt=""
                  />
                  <UserName>{user.displayName}</UserName>
                </UserButton>
              ))}
          </UserList>
          <Wrapper>
            <ActionButton
              theme={theme}
              disabled={selected.length === 0}
              onClick={handleCreateConversation}
            >
              Start conversation
            </ActionButton>
          </Wrapper>
        </>
      )}
    </Modal>
  );
}
