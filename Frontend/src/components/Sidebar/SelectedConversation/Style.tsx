import styled from "styled-components";
import { StyledProps, color } from "../../../library";

export const Flex = styled.div<StyledProps>`
  display: flex;
  height: 80px;
  padding: 10px 15px;
  align-items: center;
  position: relative;
  cursor: pointer;
  
  &:hover .delete-btn {
    opacity: 1;
  }

  border-bottom: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
`;

export const Image = styled.img`
  width: 55px;
  height: 55px;
  border-radius: 50%;
  margin-right: 10px;
`;

export const DeleteButton = styled.button`
  background: transparent;
  border: none;
  color: #ff4d4d;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0; 
  transition: opacity 0.2s ease;
  margin-left: auto;
  
  &:hover {
    color: #ff0000;
    background-color: rgba(255, 0, 0, 0.1);
    border-radius: 50%;
  }
`;

export const Name = styled.p<StyledProps>`
  font-weight: 500;
  font-size: 0.95rem; 
  margin: 0;
  padding: 0;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.title : color.darkMode.title};
`;

// ... keep existing ...

export const LastMessage = styled.p<StyledProps>`
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  font-size: 0.85rem;
  margin: 0;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// ... keep existing ...

export const Notify = styled.div<StyledProps>`
  right: 20px;
  font-size: 0.5rem;
  color: ${({ theme }) => (theme === "light" ? color.primary : color.primary)};
  position: absolute;
`;

export const Relative = styled.div`
  margin: 0 25px; /* Adjusted margin */
  position: relative;
  padding-right: 15px;
`;

export const ImagePrimary = styled.img`
  top: -6px;
  left: -35px; /* Adjusted */
  z-index: 1;
  width: 35px; /* Adjusted */
  padding: 1px;
  display: flex;
  border-radius: 50%;
  position: absolute;
  align-items: center;
  margin: 0 10px 2px 10px;
  border: double 1px transparent;
  background-clip: content-box, border-box;
`;
export const ImageSecondary = styled.img`
  top: -25px; /* Adjusted */
  left: -10px; /* Adjusted */
  width: 40px; /* Adjusted */
  border-radius: 50%;
  position: absolute;
`;

export const MessageInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  margin-left: 10px;
`;

export const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

export const Timestamp = styled.span<StyledProps>`
  font-size: 0.7rem;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  opacity: 0.7;
  white-space: nowrap;
`;

export const OnlineIndicator = styled.div<StyledProps>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #25d366;
  position: absolute;
  bottom: 2px;
  right: 2px;
  border: 2px solid ${({ theme }) =>
    theme === "light" ? "#fff" : "#1f1f1f"};
`;

export const MessageStatus = styled.span`
  margin-right: 4px;
  color: #53bdeb;
  font-size: 0.85rem;
`;

export const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;



