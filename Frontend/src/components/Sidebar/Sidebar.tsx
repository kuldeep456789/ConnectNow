import ClickAwayListener from "react-click-away-listener";
import { Link, useNavigate } from "react-router-dom";
import { LuPlus, LuPanelLeftClose, LuPanelLeftOpen, LuSettings } from "react-icons/lu";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  ChatButton,
  Container,
  StyledNavbar,
  PrimaryContainer,
  ProfileButton,
  ProfileMenu,
  ProfilePicture,
  ShowProfileButton,
  StyledSideBar,
  SignOutButton,
  ThemeButton,
  Wrapper,
  Text,
  SelectConversationContainer,


  ContactsSection,
  SectionTitle,
  UserItem,
  UserAvatar,
  UserAvatarPlaceholder,
  UserInfo,
  UserName,
  UserEmail,

  ToggleButton,
  SidebarFooter,
  SettingsButton,
  AvatarWrapper,
  OnlineIndicator
} from "./Style";
import { useTheme } from "../../hooks/useTheme";
import { useUserStore } from "../../hooks";
import { Spinner } from "../Core";
import {
  DEFAULT_AVATAR,
  IMAGE_PROXY,
  getInitials,
} from "../../library";
import { CreateConversation, Profile, SelectConversation } from ".";
import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import api from "../../services/api";



export function Sidebar() {
  const { currentUser, setCurrentUser } = useUserStore();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isConversationModalOpen, setConversationModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const { data, error, loading, refetch } = useCollectionQuery(
    "conversations",
    "/conversations"
  );

  // Fetch all users
  useState(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await api.get("/users/search?q=");
        setAllUsers(res.data.users || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  });

  const signOutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("User signed out successfully");
  };

  const handleProfileClick = () => {
    setProfileOpen(true);
    setIsSettingOpen(false);
  };

  // Handle user click to start conversation
  const handleUserClick = async (user: any) => {
    try {
      // Check if conversation already exists
      const existingConv = data?.find((conv: any) => {
        return conv.users?.length === 2 && conv.users?.includes(user.uid);
      });

      if (existingConv) {
        // Navigate to existing conversation
        navigate(`/${existingConv.conversationId}`);
      } else {
        // Create new conversation
        const res = await api.post("/conversations", {
          users: [user.uid],
          group: null,
        });

        // Refetch conversations to update the list
        refetch && refetch();

        // Navigate to new conversation
        navigate(`/${res.data.conversationId}`);
        toast.success(`Started conversation with ${user.displayName}`);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
      toast.error("Failed to start conversation");
    }
  };

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];





    // Sort by most recent
    filtered.sort((a: any, b: any) => {
      const aTime = a.updatedAt?.seconds || 0;
      const bTime = b.updatedAt?.seconds || 0;
      return bTime - aTime;
    });

    return filtered;
  }, [data, currentUser]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];

    // Exclude current user
    const filtered = allUsers.filter((user: any) => user.uid !== currentUser?.uid);
    return filtered;
  }, [allUsers, currentUser]);



  const handlePlusClick = () => {
    if (collapsed) setCollapsed(false);
    // Modal open logic is handled by state, but if we wanted to focus search it would be here
    // For now, adhering to User Request to just open modal or whatever was requested.
    // Actually user asked for "plus icon people in sidebar", implying search focus?
    // "when i clicked they slightly hide on left side" - sidebar collapse
    // "remove in sidebar , search bar" - Wait, user ASKED TO REMOVE SEARCH BAR in previous step.
    // So Plus button probably just opens modal now.
    setConversationModalOpen(true);
  };

  return (
    <StyledSideBar theme={theme} $collapsed={collapsed}>
      <StyledNavbar theme={theme} $collapsed={collapsed}>
        {!collapsed && (
          <Link
            to="/"
            style={{
              textDecoration: "none",
              fontSize: "calc(24 / 16 * 1rem)",
              fontWeight: 500,
              color: theme === "light" ? "#24292f" : "#fff",
            }}
          >
            Chatify
          </Link>
        )}

        <Wrapper theme={theme}>
          <PrimaryContainer theme={theme}>
            <ChatButton
              theme={theme}
              aria-label="New conversation"
              onClick={handlePlusClick}
            >
              <LuPlus />
            </ChatButton>
          </PrimaryContainer>
          <ToggleButton theme={theme} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <LuPanelLeftOpen size={24} /> : <LuPanelLeftClose size={24} />}
          </ToggleButton>
        </Wrapper>
      </StyledNavbar>

      {isProfileOpen && theme && (
        <Profile
          theme={theme}
          isOpen={isProfileOpen}
          setProfileOpen={setProfileOpen}
        />
      )}

      {isConversationModalOpen && theme && (
        <CreateConversation
          theme={theme}
          isOpen={isConversationModalOpen}
          setConversationModalOpen={setConversationModalOpen}
        />
      )}





      {/* Conversations Section */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <Container>
          <Text>Something went wrong</Text>
        </Container>
      ) : filteredConversations.length > 0 ? (
        <SelectConversationContainer>
          {filteredConversations.map((item: any) => (
            <SelectConversation
              key={item.conversationId}
              theme={theme}
              conversation={item}
              conversationId={item.conversationId}
              collapsed={collapsed}
            />
          ))}
        </SelectConversationContainer>
      ) : null}

      {/* All Users / Contacts Section */}
      <ContactsSection theme={theme} $collapsed={collapsed}>
        <SectionTitle theme={theme}>
          All Contacts
        </SectionTitle>
        {loadingUsers ? (
          <Container>
            <Spinner />
          </Container>
        ) : filteredUsers.length === 0 ? (
          <Container>
            <Text theme={theme}>
              No contacts available
            </Text>
          </Container>
        ) : (
          filteredUsers.map((user: any) => (
            <UserItem
              key={user.uid}
              theme={theme}
              onClick={() => handleUserClick(user)}
            >
              <AvatarWrapper>
                {user.photoURL && user.photoURL !== DEFAULT_AVATAR ? (
                  <UserAvatar src={IMAGE_PROXY(user.photoURL)} alt={user.displayName} />
                ) : (
                  <UserAvatarPlaceholder theme={theme || "light"}>
                    {getInitials(user.displayName || user.email || "?")}
                  </UserAvatarPlaceholder>
                )}
                <OnlineIndicator />
              </AvatarWrapper>
              {!collapsed && (
                <UserInfo $collapsed={collapsed}>
                  <UserName theme={theme}>{user.displayName || "Unknown"}</UserName>
                  <UserEmail theme={theme}>{user.email}</UserEmail>
                </UserInfo>
              )}
            </UserItem>
          ))
        )}
      </ContactsSection>

      <SidebarFooter theme={theme} $collapsed={collapsed}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ProfileButton onClick={() => setIsSettingOpen(!isSettingOpen)}>
            <ProfilePicture
              src={IMAGE_PROXY(currentUser?.photoURL ?? DEFAULT_AVATAR)}
              alt="profile picture"
            />
          </ProfileButton>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <UserName theme={theme} style={{ fontSize: '0.9rem' }}>{currentUser?.displayName || "Me"}</UserName>
            </div>
          )}
        </div>

        {!collapsed && (
          <SettingsButton theme={theme} onClick={() => setIsSettingOpen(!isSettingOpen)}>
            <LuSettings size={22} />
          </SettingsButton>
        )}

        {isSettingOpen && (
          <ClickAwayListener onClickAway={() => setIsSettingOpen(false)}>
            <ProfileMenu theme={theme}>
              <ShowProfileButton
                theme={theme}
                onClick={handleProfileClick}
              >
                Profile
              </ShowProfileButton>
              <ThemeButton theme={theme} onClick={toggleTheme}>
                {theme === "light" ? "Dark mode" : "Light mode"}
              </ThemeButton>
              <SignOutButton theme={theme} onClick={signOutUser}>
                Sign out
              </SignOutButton>
            </ProfileMenu>
          </ClickAwayListener>
        )}
      </SidebarFooter>
    </StyledSideBar>
  );
}
