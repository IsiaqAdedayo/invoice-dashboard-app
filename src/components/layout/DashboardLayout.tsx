/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { theme } from "@/styles/theme";
import { Badge, Dropdown, Layout } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import styled from "styled-components";

const { Sider, Content } = Layout;

// ─── Styled Components ────────────────────────────────────────────────────────

const AppLayout = styled(Layout)`
  min-height: 100vh;
  background: ${theme.colors.pageBg} !important;
`;

const SidebarWrapper = styled(Sider)`
  background: ${theme.colors.sidebarBg} !important;
  border-right: 1px solid ${theme.colors.sidebarBorder} !important;
  position: fixed !important;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  overflow: hidden;

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* Subtle noise texture overlay */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
    opacity: 0.4;
    pointer-events: none;
  }
`;

const LogoArea = styled.div`
  padding: 22px 20px 16px;
  border-bottom: 1px solid ${theme.colors.sidebarBorder};
  flex-shrink: 0;
`;

const LogoMark = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.div`
  width: 34px;
  height: 34px;
  background: ${theme.colors.primary};
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  letter-spacing: -0.5px;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LogoName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.3px;
  line-height: 1.1;
`;

const LogoTagline = styled.span`
  font-size: 10px;
  color: ${theme.colors.sidebarText};
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const NavSection = styled.div`
  padding: 16px 12px 8px;
  flex: 1;
  overflow-y: auto;
`;

const NavLabel = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: rgba(139, 146, 165, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 0 8px;
  margin-bottom: 4px;
  margin-top: 16px;

  &:first-child {
    margin-top: 0;
  }
`;

const NavItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  position: relative;
  background: ${({ $active }) =>
    $active ? "rgba(99,102,241,0.12)" : "transparent"};
  color: ${({ $active }) => ($active ? "#fff" : theme.colors.sidebarText)};
  margin-bottom: 1px;

  &:hover {
    background: ${({ $active }) =>
      $active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)"};
    color: #fff;
  }

  ${({ $active }) =>
    $active &&
    `
    &::before {
      content: '';
      position: absolute;
      left: 0; top: 50%;
      transform: translateY(-50%);
      width: 3px; height: 18px;
      background: #6366F1;
      border-radius: 0 3px 3px 0;
    }
  `}
`;

const NavIcon = styled.span<{ $active?: boolean }>`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  color: ${({ $active }) => ($active ? "#6366F1" : "inherit")};
`;

const NavText = styled.span`
  font-size: 13.5px;
  font-weight: 500;
  flex: 1;
`;

const NavBadge = styled.span`
  background: ${theme.colors.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
`;

const SidebarBottom = styled.div`
  padding: 12px;
  border-top: 1px solid ${theme.colors.sidebarBorder};
  flex-shrink: 0;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const UserAvatar = styled.div<{ $role: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $role }) =>
    $role === "admin" ? "rgba(99,102,241,0.2)" : "rgba(16,185,129,0.2)"};
  border: 1px solid
    ${({ $role }) =>
      $role === "admin" ? "rgba(99,102,241,0.3)" : "rgba(16,185,129,0.3)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $role }) => ($role === "admin" ? "#818CF8" : "#34D399")};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 11px;
  color: ${theme.colors.sidebarText};
  text-transform: capitalize;
`;

const ChevronIcon = styled.span`
  color: ${theme.colors.sidebarText};
  font-size: 10px;
  flex-shrink: 0;
`;

// ─── Topbar ───────────────────────────────────────────────────────────────────

const Topbar = styled.header`
  height: 58px;
  background: ${theme.colors.cardBg};
  border-bottom: 1px solid ${theme.colors.cardBorder};
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 12px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const TopbarLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BreadcrumbItem = styled.span<{ $active?: boolean }>`
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) =>
    $active ? theme.colors.textPrimary : theme.colors.textHint};
`;

const BreadcrumbSep = styled.span`
  color: ${theme.colors.textHint};
  font-size: 12px;
`;

const TopbarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid ${theme.colors.cardBorder};
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  transition: all 0.15s;

  &:hover {
    background: ${theme.colors.divider};
    color: ${theme.colors.textPrimary};
  }
`;

const RolePill = styled.div<{ $role: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: ${theme.radius.full};
  background: ${({ $role }) =>
    $role === "admin" ? theme.colors.primaryLight : theme.colors.successLight};
  border: 1px solid
    ${({ $role }) =>
      $role === "admin" ? theme.colors.primaryBorder : "#A7F3D0"};
  font-size: 12px;
  font-weight: 600;
  color: ${({ $role }) =>
    $role === "admin" ? theme.colors.primary : theme.colors.success};
  cursor: pointer;
`;

const RoleDot = styled.span<{ $role: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $role }) =>
    $role === "admin" ? theme.colors.primary : theme.colors.success};
`;

// ─── Main Content ─────────────────────────────────────────────────────────────

const MainWrapper = styled(Layout)<{ $collapsed: boolean }>`
  margin-left: ${({ $collapsed }) => ($collapsed ? "0px" : "220px")};
  transition: margin-left 0.2s;
  background: ${theme.colors.pageBg} !important;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentWrapper = styled(Content)`
  padding: 24px;
  min-height: calc(100vh - 58px);

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const MobileOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  role: "admin" | "customer";
  userName?: string;
}

type NavItem = {
  key: string;
  label: string;
  icon: string;
  getPath: (role: "admin" | "customer") => string;
  badge?: number;
  adminOnly?: boolean;
};

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: "⊞",
    getPath: (role) => `/dashboard/${role}`,
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: "≡",
    getPath: (role) => `/dashboard/${role}/invoices`,
  },
  {
    key: "customers",
    label: "Customers",
    icon: "◎",
    getPath: (role) => `/dashboard/${role}/customers`,
    adminOnly: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: "⬡",
    getPath: (role) => `/dashboard/${role}/analytics`,
    adminOnly: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
  role,
  userName = "User",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const normalize = (path: string) => path.replace(/\/+$/, "");

  const getPath = (item: any) =>
    typeof item.getPath === "function" ? item.getPath(role) : item.getPath;

  const activeKey =
    NAV_ITEMS.find((item) => {
      const itemPath = normalize(item.getPath(role));
      const current = normalize(pathname);

      if (itemPath === `/dashboard/${role}`) {
        // exact match for overview only
        return current === itemPath;
      }

      return current === itemPath || current.startsWith(itemPath + "/");
    })?.key || "overview";

  const pageLabel =
    NAV_ITEMS.find((item) => item.key === activeKey)?.label || "Dashboard";

  const userMenuItems = [
    { key: "profile", label: "Profile", onClick: () => {} },
    {
      key: "settings",
      label: "Settings",
      onClick: () => router.push("/dashboard/settings"),
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Sign out",
      danger: true,
      onClick: () => {
        signOut();
      },
    },
  ];

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || role === "admin",
  );

  const sidebarContent = (
    <>
      <LogoArea>
        <LogoMark>
          <LogoIcon>Pv</LogoIcon>
          <LogoText>
            <LogoName>Payvance</LogoName>
            <LogoTagline>Finance Suite</LogoTagline>
          </LogoText>
        </LogoMark>
      </LogoArea>

      <NavSection>
        <NavLabel>Main</NavLabel>
        {visibleItems.slice(0, 2).map((item) => {
          const path = item.getPath(role);
          const isActive = activeKey === item.key;
          return (
            <NavItem
              key={item.key}
              $active={isActive}
              onClick={() => {
                router.push(path);
                setMobileOpen(false);
              }}
            >
              <NavIcon $active={isActive}>{item.icon}</NavIcon>
              <NavText>{item.label}</NavText>
              {item.badge && <NavBadge>{item.badge}</NavBadge>}
            </NavItem>
          );
        })}

        {role === "admin" && (
          <>
            <NavLabel>Manage</NavLabel>
            {visibleItems.slice(2).map((item) => {
              const path = item.getPath(role);
              const isActive = activeKey === item.key;
              return (
                <NavItem
                  key={item.key}
                  $active={isActive}
                  onClick={() => {
                    router.push(path);
                    setMobileOpen(false);
                  }}
                >
                  <NavIcon $active={isActive}>{item.icon}</NavIcon>
                  <NavText>{item.label}</NavText>
                </NavItem>
              );
            })}
          </>
        )}

        <NavLabel>Account</NavLabel>
        <NavItem onClick={() => router.push("/settings")}>
          <NavIcon>⊙</NavIcon>
          <NavText>Settings</NavText>
        </NavItem>
      </NavSection>

      <SidebarBottom>
        <Dropdown
          menu={{ items: userMenuItems as any }}
          placement="topLeft"
          trigger={["click"]}
        >
          <UserCard>
            <UserAvatar $role={role}>
              {userName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </UserAvatar>
            <UserInfo>
              <UserName>{userName}</UserName>
              <UserRole>{role}</UserRole>
            </UserInfo>
            <ChevronIcon>⋯</ChevronIcon>
          </UserCard>
        </Dropdown>
      </SidebarBottom>
    </>
  );

  return (
    <AppLayout>
      {/* Desktop Sidebar */}
      <SidebarWrapper
        width={220}
        collapsedWidth={0}
        collapsed={collapsed}
        breakpoint="md"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
      >
        {sidebarContent}
      </SidebarWrapper>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <MobileOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: 220,
                background: theme.colors.sidebarBg,
                borderRight: `1px solid ${theme.colors.sidebarBorder}`,
                zIndex: 200,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <MainWrapper $collapsed={collapsed}>
        <Topbar>
          <TopbarLeft>
            <IconBtn
              onClick={() => setMobileOpen(true)}
              className="block md:hidden"
            >
              ☰
            </IconBtn>
            <Breadcrumb>
              <BreadcrumbItem>Payvance</BreadcrumbItem>
              <BreadcrumbSep>/</BreadcrumbSep>
              <BreadcrumbItem $active>{pageLabel}</BreadcrumbItem>
            </Breadcrumb>
          </TopbarLeft>

          <TopbarRight>
            <RolePill $role={role}>
              <RoleDot $role={role} />
              {role === "admin" ? "Admin" : "Customer"}
            </RolePill>
            <Badge count={3} size="small">
              <IconBtn>🔔</IconBtn>
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems as any }}
              placement="bottomRight"
            >
              <UserAvatar $role={role} style={{ cursor: "pointer" }}>
                {userName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </UserAvatar>
            </Dropdown>
          </TopbarRight>
        </Topbar>

        <ContentWrapper>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </ContentWrapper>
      </MainWrapper>
    </AppLayout>
  );
}
