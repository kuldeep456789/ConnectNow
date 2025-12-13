import styled from "styled-components";
import { StyledProps, color } from "../../../library";

export const Flex = styled.div<StyledProps>`
  display: flex;
  height: 100px;
  padding: 15px;
  align-items: center;
  position: relative;
  border-bottom: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
`;

export const Image = styled.img`
  width: 65px;
  height: 65px;
  border-radius: 50%;
  margin-right: 10px;
`;

export const Name = styled.p<StyledProps>`
  font-weight: 500;
  font-size: 1rem;
  margin: 0;
  padding: 0;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.title : color.darkMode.title};
`;

export const LastMessage = styled.p<StyledProps>`
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  font-size: 0.875rem;
  margin: 0;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Notify = styled.div<StyledProps>`
  right: 20px;
  font-size: 0.5rem;
  color: ${({ theme }) => (theme === "light" ? color.primary : color.primary)};
  position: absolute;
`;

export const Relative = styled.div`
  margin: 0 30px;
  position: relative;
  padding-right: 15px;
`;

export const ImagePrimary = styled.img`
  top: -6px;
  left: -40px;
  z-index: 1;
  width: 40px;
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
  top: -30px;
  left: -13px;
  width: 45px;
  border-radius: 50%;
  position: absolute;
`;

export const MessageInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  font-size: 0.75rem;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  opacity: 0.7;
  white-space: nowrap;
`;

export const OnlineIndicator = styled.div<StyledProps>`
  width: 12px;
  height: 12px;
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
  font-size: 0.9rem;
`;

export const AvatarWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;


