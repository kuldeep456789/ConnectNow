import ClickAwayListener from "react-click-away-listener";
import { Link, useNavigate } from "react-router-dom";
import { LuChevronDown, LuPanelLeftClose, LuPanelLeftOpen, LuSettings } from "react-icons/lu";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Container,
  StyledNavbar,
  ProfileButton,
  ProfileMenu,
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
  UserInfo,
  UserName,
  UserEmail,
  ToggleButton,
  SidebarFooter,
  SettingsButton,
  AvatarWrapper,
  OnlineIndicator,
  SectionHeader,
  CollapseToggle,
} from "./Style";
import { useTheme } from "../../hooks/useTheme";
import { useUserStore } from "../../hooks";
import { Spinner } from "../Core";
import {
  IMAGE_PROXY,
} from "../../library";
import { Profile, SelectConversation } from ".";
import { Avatar } from "../Shared";
import { useCollectionQuery } from "../../hooks/useCollectionQuery";
import api from "../../services/api";



export function Sidebar() {
  const { currentUser, setCurrentUser } = useUserStore();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isContactsCollapsed, setIsContactsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const { data, error, loading, refetch } = useCollectionQuery(
    "conversations",
    "/conversations"
  );


  useState(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await api.get("/users/search?q=");
        setAllUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
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


  const handleUserClick = async (user: any) => {
    try {

      const existingConv = data?.find((conv: any) => {
        return conv.users?.length === 2 && conv.users?.includes(user.uid);
      });

      if (existingConv) {

        navigate(`/${existingConv.conversationId}`);
      } else {

        const res = await api.post("/conversations", {
          recipientUid: user.uid
        });


        refetch && refetch();


        navigate(`/${res.data.conversationId}`);
        toast.success(`Started conversation with ${user.displayName}`);
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
      toast.error("Failed to start conversation");
    }
  };


  const filteredConversations = useMemo(() => {
    if (!data) return [];

    let filtered = [...data];






    filtered.sort((a: any, b: any) => {
      const aTime = a.updatedAt?.seconds || 0;
      const bTime = b.updatedAt?.seconds || 0;
      return bTime - aTime;
    });

    return filtered;
  }, [data, currentUser]);


  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];


    const filtered = allUsers.filter((user: any) => user.uid !== currentUser?.uid);
    return filtered;
  }, [allUsers, currentUser]);





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







      { }
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
              onRefresh={refetch}
            />
          ))}
        </SelectConversationContainer>
      ) : null}

      { }
      <ContactsSection theme={theme} $collapsed={collapsed}>
        <SectionHeader theme={theme} onClick={() => setIsContactsCollapsed(!isContactsCollapsed)}>
          <SectionTitle theme={theme}>All Contacts</SectionTitle>
          <CollapseToggle theme={theme} $isCollapsed={isContactsCollapsed}>
            <LuChevronDown size={18} />
          </CollapseToggle>
        </SectionHeader>

        {!isContactsCollapsed && (
          <>
            {loadingUsers ? (
              <Container>
                <Spinner />
              </Container>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: "10px 20px", opacity: 0.5 }}>No contacts found</div>
            ) : (
              filteredUsers.map((user: any) => {
                const displayName = user.displayName || user.email?.split("@")[0] || "User";
                const photo = user.photoURL ? IMAGE_PROXY(user.photoURL) : null;

                return (
                  <UserItem
                    key={user.uid || user.id}
                    theme={theme}
                    onClick={() => handleUserClick(user)}
                  >
                    <AvatarWrapper>
                      <Avatar
                        src={photo}
                        name={displayName}
                        size="40px"
                      />
                      <OnlineIndicator />
                    </AvatarWrapper>
                    {!collapsed && (
                      <UserInfo $collapsed={collapsed}>
                        <UserName theme={theme} className="truncate">{displayName}</UserName>
                        <UserEmail theme={theme} className="truncate">{user.email}</UserEmail>
                      </UserInfo>
                    )}
                  </UserItem>
                );
              })
            )}
          </>
        )}
      </ContactsSection>

      <SidebarFooter theme={theme} $collapsed={collapsed}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ProfileButton onClick={() => setIsSettingOpen(!isSettingOpen)}>
            <Avatar
              src={currentUser?.photoURL ? IMAGE_PROXY(currentUser.photoURL) : null}
              name={currentUser?.displayName || currentUser?.email || "?"}
              size="50px"
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
