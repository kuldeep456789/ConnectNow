import { useState, useRef } from "react";
import { FiCamera } from "react-icons/fi";
import { LuTrash2 } from "react-icons/lu";
import toast from "react-hot-toast";
import { useUserStore } from "../../../hooks";
import {
  Thick,
  Text,
  Container,
  Wrapper,
  EditButton,
  Input,
  ButtonGroup,
  SaveButton,
  CancelButton,
  AvatarContainer,
  UploadButton,
  RemoveButton,
} from "./Style";
import { Modal } from "../../Core";
import { IMAGE_PROXY } from "../../../library";
import api from "../../../services/api";
import { Avatar } from "../../Shared";

type ProfileProps = {
  isOpen: boolean;
  theme: string;
  setProfileOpen: (value: boolean) => void;
};

export function Profile({ theme, setProfileOpen, isOpen }: ProfileProps) {
  const { currentUser, setCurrentUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const photoURL = uploadRes.data.url;

      // Update profile with new photo
      const profileRes = await api.put("/profile", { photoURL });

      // Update local state
      setCurrentUser({
        ...currentUser,
        photoURL: profileRes.data.user.photoURL,
      } as any);

      toast.success("Avatar updated!");
      setUploading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload avatar");
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;

    setUploading(true);
    try {
      // Update profile with empty photoURL
      const profileRes = await api.put("/profile", { photoURL: "" });

      // Update local state
      setCurrentUser({
        ...currentUser,
        photoURL: profileRes.data.user.photoURL,
      } as any);

      toast.success("Avatar removed!");
      setUploading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove avatar");
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/profile", { displayName });

      // Update local state
      setCurrentUser({
        ...currentUser,
        displayName: res.data.user.displayName,
      } as any);

      toast.success("Profile updated!");
      setIsEditing(false);
      setSaving(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(currentUser?.displayName || "");
    setIsEditing(false);
  };

  return (
    <Modal
      theme={theme}
      isOpen={isOpen}
      onClose={() => setProfileOpen(false)}
      title={isEditing ? "Edit Profile" : "Your Profile"}
    >
      <Container>
        <AvatarContainer>
          <Avatar
            src={currentUser?.photoURL ? IMAGE_PROXY(currentUser.photoURL) : null}
            name={currentUser?.displayName || currentUser?.email || "?"}
            size="80px"
          />

          {isEditing && (
            <>
              <UploadButton htmlFor="avatar-upload">
                <FiCamera />
              </UploadButton>

              {currentUser?.photoURL && (
                <RemoveButton onClick={handleRemoveAvatar} title="Remove photo">
                  <LuTrash2 />
                </RemoveButton>
              )}

              <input
                ref={fileInputRef}
                id="avatar-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </>
          )}
        </AvatarContainer>
      </Container>
      <Wrapper>
        <Text theme={theme}>
          <Thick>ID:</Thick> {currentUser?.uid}
        </Text>
        <Text theme={theme}>
          <Thick>Name:</Thick>{" "}
          {isEditing ? (
            <Input
              theme={theme}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display Name"
            />
          ) : (
            currentUser?.displayName
          )}
        </Text>
        <Text theme={theme}>
          <Thick>Email:</Thick> {currentUser?.email}
        </Text>
      </Wrapper>
      {isEditing ? (
        <ButtonGroup>
          <SaveButton onClick={handleSave} disabled={saving || uploading}>
            {saving ? "Saving..." : "Save"}
          </SaveButton>
          <CancelButton theme={theme} onClick={handleCancel}>
            Cancel
          </CancelButton>
        </ButtonGroup>
      ) : (
        <EditButton theme={theme} onClick={() => setIsEditing(true)}>
          Edit Profile
        </EditButton>
      )}
    </Modal>
  );
}
