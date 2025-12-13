import ClickAwayListener from "react-click-away-listener";
import "./style.css";
import { REACTIONS_UI } from "../../../library";
import { ChatReactPopUpContainer } from "./Style";
import toast from "react-hot-toast";

type ReactionPopupProps = {
  isOpen: boolean;
  position: "left" | "right";
  setIsOpen: (value: boolean) => void;
  messageId: string;
  currentReaction: string;
  theme: string;
};

import api from "../../../services/api";

export default function ChatReactPopUp({
  position,
  setIsOpen,
  currentReaction,
  messageId,
  theme,
}: ReactionPopupProps) {

  const updateReaction = async (value: string) => {
    try {
      await api.post(`/messages/${messageId}/reactions`, { reaction: value });
      window.location.reload(); // Brute force refresh for MVP
    } catch (error) {
      toast.error("Failed to update reaction");
    }
    setIsOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <ChatReactPopUpContainer
        theme={theme}
        id="popup"
        className={position === "left" ? "popup__left" : "popup__right"}
      >
        {Object.entries(REACTIONS_UI).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              if (key === currentReaction) updateReaction(key); // Toggle logic handled in backend actually, but here we just send key. Backend toggles if same. 
              // Actually my backend logic: if same, removed. If diff, updated.
              // So I just send the key. 
              updateReaction(key);
            }}
            className={key === currentReaction ? "current-reaction" : ""}
          >
            <img title={key} src={value.gif} alt="" />
          </button>
        ))}
      </ChatReactPopUpContainer>
    </ClickAwayListener>
  );
}
