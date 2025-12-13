import styled from "styled-components";
import { StyledProps, color } from "../../library";


export const ToggleButton = styled.button<StyledProps>`
  background: transparent;
  border: none;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) =>
    theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)"};
    color: ${color.primary};
  }
`;

export const StyledSideBar = styled.div<StyledProps & { $collapsed?: boolean }>`
  width: 100%;
  height: 100vh;
  padding-bottom: 80px; /* Space for footer */
  overflow-x: hidden;
  overflow-y: auto;
  border-right: none;
  position: relative;
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.background : color.darkMode.background};

  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    border-radius: 20px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) =>
    theme === "light" ? "darkgray" : color.darkGreyDark};
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background: ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.background};
    border-radius: 0 0 20px 0;
  }
  @media screen and (min-width: 869px) {
    width: ${({ $collapsed }) => $collapsed ? "80px" : "350px"};
    border-right: 1px solid
      ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  }
`;

export const StyledNavbar = styled.div<StyledProps & { $collapsed?: boolean }>`
  z-index: 2;
  height: 80px;
  width: 100%;
  position: fixed;
  display: flex;
  padding: 0 ${({ $collapsed }) => $collapsed ? "10px" : "30px"};
  align-items: center;
  justify-content: ${({ $collapsed }) => $collapsed ? "center" : "space-between"};
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.background : color.darkMode.background};
  border-bottom: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};

  border-right: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};

  @media screen and (min-width: 869px) {
    width: ${({ $collapsed }) => $collapsed ? "80px" : "350px"};
  }
`;

export const Wrapper = styled.div<StyledProps>`
  display: flex;
`;

export const ProfileButtonContainer = styled.div`
  position: relative;
`;

export const ProfileButton = styled.button`
  border: none;
  background-color: transparent;
`;

export const ProfileMenu = styled.div<StyledProps>`
  z-index: 1;
  position: absolute;
  top: auto;
  bottom: 60px;
  left: 10px;
  width: 160px;
  background-color: ${({ theme }) =>
    theme === "light" ? color.white : "#1e1e1e"};
  border: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.lightGreyDark};
  border-radius: 3px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
`;

export const ShowProfileButton = styled.button<StyledProps>`
  border: none;
  width: 100%;
  font-size: 1rem;
  padding: 10px 12px;
  transition: all 0.2s ease;
  background-color: transparent;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  &:hover {
    color: ${({ theme }) =>
    theme === "light"
      ? color.lightMode.navHoverText
      : color.darkMode.navHoverText};
  }
`;

export const ThemeButton = styled.button<StyledProps>`
  border: none;
  width: 100%;
  font-size: 1rem;
  padding: 10px 12px;
  transition: all 0.2s ease;
  background-color: transparent;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  border-top: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.lightGreyDark};
  border-bottom: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.lightGreyDark};
  &:hover {
    color: ${({ theme }) =>
    theme === "light"
      ? color.lightMode.navHoverText
      : color.darkMode.navHoverText};
  }
`;

export const SignOutButton = styled.button<StyledProps>`
  border: none;
  width: 100%;
  font-size: 1rem;
  padding: 10px 12px;
  transition: all 0.2s ease;
  background-color: transparent;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  &:hover {
    color: ${({ theme }) =>
    theme === "light"
      ? color.lightMode.navHoverText
      : color.darkMode.navHoverText};
  }
`;
export const ChatButton = styled.button<StyledProps>`
  width: 50px;
  height: 50px;
  border: none;
  display: flex;
  margin-right: 15px;
  border-radius: 10%;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  transition: all 0.2s ease;
  :hover {
    color: ${({ theme }) =>
    theme === "light"
      ? color.lightMode.navHoverText
      : color.darkMode.navHoverText};
  }
`;

export const ProfilePicture = styled.img`
  width: 50px;
  border-radius: 10%;
`;

export const SecondaryContainer = styled.div<StyledProps>`
  position: relative;
`;

export const PrimaryContainer = styled.div<StyledProps>`
  position: relative;
`;

export const Container = styled.div`
  display: flex;
  align-items: center;
  margin-top: 80px;
  flex-direction: column;
  justify-content: center;
`;

export const Text = styled.p<StyledProps>`
  margin: 30px 0;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
`;
export const SelectConversationButton = styled.button<StyledProps>`
  width: 150px;
  border: none;
  padding: 10px;
  font-size: 0.9rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  background-color: ${({ theme }) =>
    theme === "light" ? color.primary : color.primary};
  color: ${({ theme }) => (theme === "light" ? color.white : color.white)};

  &:hover {
    background-color: ${({ theme }) =>
    theme === "light"
      ? color.lightMode.primaryHoverLight
      : color.darkMode.primaryHoverDark};
  }
`;

export const SelectConversationContainer = styled.div`
  margin-top: 80px;
`;

export const SearchContainer = styled.div<StyledProps>`
  padding: 10px 15px;
  margin-top: 80px;
  border-bottom: 1px solid ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
`;

export const SearchInput = styled.input<StyledProps>`
  width: 100%;
  padding: 10px 15px;
  border: 1px solid ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  border-radius: 8px;
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.background : color.darkMode.background};
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${color.primary};
  }

  &::placeholder {
    color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
    opacity: 0.6;
  }
`;

export const FilterContainer = styled.div<StyledProps & { $collapsed?: boolean }>`
  display: ${({ $collapsed }) => $collapsed ? "none" : "flex"};
  gap: 8px;
  padding: 10px 15px;
  border-bottom: 1px solid ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
`;

export const FilterTab = styled.button<StyledProps & { $active?: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  background-color: ${({ $active, theme }) =>
    $active
      ? color.primary
      : theme === "light"
        ? color.lightMode.border
        : color.darkMode.border};
  
  color: ${({ $active, theme }) =>
    $active
      ? "white"
      : theme === "light"
        ? color.lightMode.text
        : color.darkMode.text};

  &:hover {
    opacity: 0.8;
  }
`;

export const UnreadBadge = styled.span`
  background-color: ${color.primary};
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
`;

export const ContactsSection = styled.div<StyledProps & { $collapsed?: boolean }>`
  margin-top: 20px;
  display: ${({ $collapsed }) => $collapsed ? "none" : "block"};
  border-top: 1px solid ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
`;

export const SectionTitle = styled.h3<StyledProps>`
  padding: 15px 20px 10px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  opacity: 0.7;
`;

export const UserItem = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};

  &:hover {
    background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  }
`;

export const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

export const UserAvatarPlaceholder = styled.div<{ theme: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.title : color.darkMode.title};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
`;

export const SidebarFooter = styled.div<StyledProps & { $collapsed?: boolean }>`
  z-index: 2;
  height: 70px;
  width: 100%;
  position: fixed;
  bottom: 0;
  display: flex;
  padding: 0 ${({ $collapsed }) => $collapsed ? "10px" : "20px"};
  align-items: center;
  justify-content: ${({ $collapsed }) => $collapsed ? "center" : "space-between"};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background-color: ${({ theme }) =>
    theme === "light" ? "rgba(255,255,255,0.8)" : "rgba(33, 33, 33, 0.8)"};
  border-top: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};

  border-right: 1px solid
    ${({ theme }) =>
    theme === "light" ? color.lightMode.border : color.darkMode.border};
  
  transition: width 0.3s ease, padding 0.3s ease;

  @media screen and (min-width: 869px) {
    width: ${({ $collapsed }) => $collapsed ? "80px" : "350px"};
  }
`;

export const SettingsButton = styled.button<StyledProps>`
  background: transparent;
  border: none;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.navText : color.darkMode.navText};
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) =>
    theme === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)"};
    color: ${color.primary};
  }
`;

export const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const OnlineIndicator = styled.div`
  width: 12px;
  height: 12px;
  background-color: #2cc069;
  border-radius: 50%;
  border: 2px solid white;
  position: absolute;
  bottom: 0;
  right: 0;
`;

export const UserInfo = styled.div<StyledProps & { $collapsed?: boolean }>`
  flex: 1;
  display: ${({ $collapsed }) => $collapsed ? "none" : "block"};
`;

export const UserName = styled.p<StyledProps>`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.title : color.darkMode.title};
  margin: 0;
`;

export const UserEmail = styled.p<StyledProps>`
  font-size: 0.8rem;
  color: ${({ theme }) =>
    theme === "light" ? color.lightMode.text : color.darkMode.text};
  opacity: 0.7;
  margin: 2px 0 0 0;
`;


