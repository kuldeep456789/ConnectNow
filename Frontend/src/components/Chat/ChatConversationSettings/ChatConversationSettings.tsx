import type { ChangeEvent, FormEvent } from "react";

import { useRef, useState } from "react";
import {
  FiChevronDown,
  FiEdit,
  FiFile,
  FiLogOut,
  FiCamera,
  FiChevronRight,
} from "react-icons/fi";

import { Container, Button, Form, NameInput, NameButton } from "./Style";
import { ConversationInfoType } from "../../../library";

import toast from "react-hot-toast";
import { Modal } from "../../Core";
import api from "../../../services/api";

type ConversationSettingsProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  setMediaViewOpen: (value: boolean) => void;
  conversation: ConversationInfoType;
  theme: string;
};
export function ChatConversationSettings({
  isOpen,
  setIsOpen,
  setMediaViewOpen,
  conversation,
  theme,
}: ConversationSettingsProps) {
  // const { id: conversationId } = useParams();
  // const { currentUser } = useUserStore();
  // const navigate = useNavigate();

  const [isChangeChatNameOpen, setIsChangeChatNameOpen] = useState(false);
  const [chatNameInputValue, setChatNameInputValue] = useState(
    conversation?.group?.groupName || ""
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!chatNameInputValue.trim()) return;
    setIsOpen(false);

    // TODO: Implement update group name API
    toast.error("Update group name not implemented in MVP backend");
    // logic would be: await api.put(`/conversations/${conversationId}`, { groupName: chatNameInputValue });
  };

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image")) {
      toast.error("Only images are allowed");
      return;
    }
    const FIVE_MB = 1024 * 1024 * 5;
    if (file.size > FIVE_MB) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // TODO: Update group image endpoint
      toast.error("Update group image not implemented in MVP backend");
      // URL is res.data.url
    } catch (error) {
      toast.error("Upload failed");
    }
  };

  const leaveGroup = async () => {
    // TODO: Leave group API
    toast.error("Leave group not implemented in MVP backend");
    // navigate("/");
  };

  const onSingleMediaClick = () => {
    setMediaViewOpen(true);
    setIsOpen(false);
  };

  return (
    <Modal
      onClose={() => setIsOpen(false)}
      theme={theme}
      title="Conversation settings"
      isOpen={isOpen}
    >
      <Container>
        {conversation.users.length > 2 && (
          <>
            <Button
              theme={theme}
              onClick={() => setIsChangeChatNameOpen((prev) => !prev)}
            >
              <FiEdit />
              Change chat name
              {isChangeChatNameOpen ? (
                <FiChevronDown className="chevron" />
              ) : (
                <FiChevronRight className="chevron" />
              )}
            </Button>
            {isChangeChatNameOpen && (
              <Form onSubmit={handleFormSubmit}>
                <NameInput
                  theme={theme}
                  value={chatNameInputValue}
                  onChange={(event) =>
                    setChatNameInputValue(event.target.value)
                  }
                  type="text"
                  placeholder="Chat name"
                />
                <NameButton
                  theme={theme}
                  disabled={chatNameInputValue.trim().length === 0}
                >
                  Change
                </NameButton>
              </Form>
            )}

            <Button theme={theme} onClick={() => fileInputRef.current?.click()}>
              <FiCamera />
              Change group photo
            </Button>

            <input
              hidden
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
            />
          </>
        )}

        <Button theme={theme} onClick={onSingleMediaClick}>
          <FiFile /> View images & files
        </Button>

        {conversation.users.length > 2 && (
          <Button theme={theme} onClick={() => leaveGroup()}>
            <FiLogOut /> Leave group
          </Button>
        )}
      </Container>
    </Modal>
  );
}
