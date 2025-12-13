import ClickAwayListener from "react-click-away-listener";
import { Link, useNavigate } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  ChatButton,
  Container,
  StyledNavbar,
  PrimaryContainer,
  ProfileButton,
  ProfileButtonContainer,
  ProfileMenu,
  ProfilePicture,
  SecondaryContainer,
  ShowProfileButton,
  StyledSideBar,
  SignOutButton,
  ThemeButton,
  Wrapper,
  Text,
  SelectConversationButton,
  SelectConversationContainer,
  SearchContainer,
  SearchInput,
  FilterContainer,
  FilterTab,
  ContactsSection,
  SectionTitle,
  UserItem,
  UserAvatar,
  UserAvatarPlaceholder,
  UserInfo,
  UserName,
  UserEmail,
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

type FilterType = "all" | "unread" | "groups";

export function Sidebar() {
  const { currentUser, setCurrentUser } = useUserStore();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isConversationModalOpen, setConversationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
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

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((conv: any) => {
        const groupName = conv.group?.groupName?.toLowerCase() || "";
        const searchLower = searchQuery.toLowerCase();
        return groupName.includes(searchLower);
      });
    }

    // Apply category filter
    if (activeFilter === "groups") {
      filtered = filtered.filter((conv: any) => conv.users?.length > 2);
    } else if (activeFilter === "unread") {
      filtered = filtered.filter((conv: any) => {
        return !conv.seen?.[currentUser?.uid || ""];
      });
    }

    // Sort by most recent
    filtered.sort((a: any, b: any) => {
      const aTime = a.updatedAt?.seconds || 0;
      const bTime = b.updatedAt?.seconds || 0;
      return bTime - aTime;
    });

    return filtered;
  }, [data, searchQuery, activeFilter, currentUser]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];

    // Exclude current user
    let filtered = allUsers.filter((user: any) => user.uid !== currentUser?.uid);

    // Apply search
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((user: any) => {
        const name = user.displayName?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        return name.includes(searchLower) || email.includes(searchLower);
      });
    }

    return filtered;
  }, [allUsers, searchQuery, currentUser]);

  return (
    <StyledSideBar theme={theme}>
      <StyledNavbar theme={theme}>
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

        <Wrapper theme={theme}>
          <PrimaryContainer theme={theme}>
            <ChatButton
              theme={theme}
              aria-label="New conversation"
              onClick={() => setConversationModalOpen(true)}
            >
              <LuPlus />
            </ChatButton>
          </PrimaryContainer>
          <SecondaryContainer theme={theme}>
            <ProfileButtonContainer>
              <ProfileButton
                onClick={() => {
                  setIsSettingOpen(!isSettingOpen);
                }}
              >
                <ProfilePicture
                  src={IMAGE_PROXY(currentUser?.photoURL ?? DEFAULT_AVATAR)}
                  alt="profile picture"
                />
              </ProfileButton>

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
            </ProfileButtonContainer>
          </SecondaryContainer>
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

      {/* Search Bar */}
      <SearchContainer theme={theme}>
        <SearchInput
          theme={theme}
          type="text"
          placeholder="Search conversations or contacts..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </SearchContainer>

      {/* Filter Tabs */}
      <FilterContainer theme={theme}>
        <FilterTab
          theme={theme}
          $active={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
        >
          All
        </FilterTab>
        <FilterTab
          theme={theme}
          $active={activeFilter === "unread"}
          onClick={() => setActiveFilter("unread")}
        >
          Unread
        </FilterTab>
        <FilterTab
          theme={theme}
          $active={activeFilter === "groups"}
          onClick={() => setActiveFilter("groups")}
        >
          Groups
        </FilterTab>
      </FilterContainer>

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
            />
          ))}
        </SelectConversationContainer>
      ) : null}

      {/* All Users / Contacts Section */}
      <ContactsSection theme={theme}>
        <SectionTitle theme={theme}>
          {searchQuery ? "Search Results" : "All Contacts"}
        </SectionTitle>
        {loadingUsers ? (
          <Container>
            <Spinner />
          </Container>
        ) : filteredUsers.length === 0 ? (
          <Container>
            <Text theme={theme}>
              {searchQuery ? "No users found" : "No contacts available"}
            </Text>
          </Container>
        ) : (
          filteredUsers.map((user: any) => (
            <UserItem
              key={user.uid}
              theme={theme}
              onClick={() => handleUserClick(user)}
            >
              {user.photoURL && user.photoURL !== DEFAULT_AVATAR ? (
                <UserAvatar src={IMAGE_PROXY(user.photoURL)} alt={user.displayName} />
              ) : (
                <UserAvatarPlaceholder theme={theme}>
                  {getInitials(user.displayName || user.email || "?")}
                </UserAvatarPlaceholder>
              )}
              <UserInfo>
                <UserName theme={theme}>{user.displayName || "Unknown"}</UserName>
                <UserEmail theme={theme}>{user.email}</UserEmail>
              </UserInfo>
            </UserItem>
          ))
        )}
      </ContactsSection>
    </StyledSideBar>
  );
}
