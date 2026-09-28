export const theme = {
  colors: {
    // Sidebar / dark surfaces
    sidebarBg: "#0F1117",
    sidebarBorder: "#1E2230",
    sidebarText: "#8B92A5",
    sidebarActive: "#FFFFFF",
    sidebarActiveBg: "rgba(99,102,241,0.15)",
    sidebarActiveAccent: "#6366F1",

    // Main surfaces
    pageBg: "#F6F7FB",
    cardBg: "#FFFFFF",
    cardBorder: "#E8EBF0",

    // Brand
    primary: "#6366F1",
    primaryHover: "#4F46E5",
    primaryLight: "#EEF2FF",
    primaryBorder: "#C7D2FE",

    // Semantic
    success: "#10B981",
    successLight: "#ECFDF5",
    warning: "#F59E0B",
    warningLight: "#FFFBEB",
    danger: "#EF4444",
    dangerLight: "#FEF2F2",
    info: "#3B82F6",
    infoLight: "#EFF6FF",

    // Text
    textPrimary: "#0F1117",
    textSecondary: "#6B7280",
    textHint: "#9CA3AF",
    textInverse: "#FFFFFF",

    // Misc
    divider: "#F1F3F7",
  },
  fonts: {
    sans: "'Sora', -apple-system, sans-serif",
    mono: "'IBM Plex Mono', 'Fira Code', monospace",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 3px rgba(15,17,23,0.06), 0 1px 2px rgba(15,17,23,0.04)",
    md: "0 4px 12px rgba(15,17,23,0.08), 0 2px 4px rgba(15,17,23,0.04)",
    lg: "0 12px 32px rgba(15,17,23,0.1), 0 4px 8px rgba(15,17,23,0.06)",
    indigo: "0 8px 24px rgba(99,102,241,0.2)",
  },
};

// Ant Design token overrides
export const antdTheme = {
  token: {
    colorPrimary: theme.colors.primary,
    colorSuccess: theme.colors.success,
    colorWarning: theme.colors.warning,
    colorError: theme.colors.danger,
    borderRadius: 10,
    fontFamily: theme.fonts.sans,
    colorBgContainer: theme.colors.cardBg,
    colorBorder: theme.colors.cardBorder,
    colorText: theme.colors.textPrimary,
    colorTextSecondary: theme.colors.textSecondary,
    fontSize: 14,
    controlHeight: 40,
    paddingContentHorizontal: 16,
  },
  components: {
    Menu: {
      itemBg: "transparent",
      itemColor: theme.colors.sidebarText,
      itemHoverBg: "rgba(255,255,255,0.06)",
      itemHoverColor: "#FFFFFF",
      itemSelectedBg: theme.colors.sidebarActiveBg,
      itemSelectedColor: "#FFFFFF",
      itemActiveBg: theme.colors.sidebarActiveBg,
      subMenuItemBg: "transparent",
      iconSize: 16,
    },
    Table: {
      headerBg: "#F8F9FC",
      headerColor: theme.colors.textHint,
      rowHoverBg: "#FAFBFF",
      borderColor: theme.colors.divider,
    },
    Input: {
      activeBorderColor: theme.colors.primary,
      hoverBorderColor: theme.colors.primaryBorder,
      activeShadow: "0 0 0 3px rgba(99,102,241,0.1)",
    },
    Button: {
      primaryShadow: theme.shadow.indigo,
    },
  },
};
