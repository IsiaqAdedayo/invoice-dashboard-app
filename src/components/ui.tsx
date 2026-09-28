"use client";

import { theme } from "@/styles/theme";
import { motion } from "framer-motion";
import { ReactNode, type SVGProps } from "react";
import styled, { css } from "styled-components";

export const IconBase = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  />
);

export const WalletIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h12A2.5 2.5 0 0 1 20 8.5V17a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 17V8.5Z" />
    <path d="M16 12h5" />
    <path d="M3 9h14" />
  </IconBase>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M5 12.5 9.3 17l9.7-10" />
  </IconBase>
);

export const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7v5l3.2 2.3" />
  </IconBase>
);

export const WarningIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M12 3.5 2.8 18.5A1.5 1.5 0 0 0 4.1 20.5h15.8a1.5 1.5 0 0 0 1.3-2L12 3.5Z" />
    <path d="M12 9v4.5" />
    <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
  </IconBase>
);

export const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
    <circle cx="10" cy="7" r="3" />
    <path d="M20 19v-1a4 4 0 0 0-2.7-3.7" />
    <path d="M16 4.2a3 3 0 0 1 0 5.7" />
  </IconBase>
);

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="5.5" />
    <path d="m16 16 4.5 4.5" />
  </IconBase>
);

export const UserIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4 18c1.5-2.8 4.2-4.2 8-4.2S18.5 15.2 20 18" />
  </IconBase>
);

export const TargetIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v3" />
    <path d="M12 19v3" />
    <path d="M2 12h3" />
    <path d="M19 12h3" />
  </IconBase>
);

export const TrendingUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M4 16 10 10l4 4 6-8" />
    <path d="M16 6h4v4" />
  </IconBase>
);

export const UndoIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M9 7H4v5" />
    <path d="M4 12a7 7 0 1 1 12.3 4.9" />
  </IconBase>
);

export const CalendarIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M3 10h18" />
  </IconBase>
);

export const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
);

export const DocumentIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="M8 3.5h6l5 5V18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" />
    <path d="M14 3.5v5h5" />
    <path d="M8.5 12h7" />
    <path d="M8.5 15h7" />
  </IconBase>
);

export const SparkIcon = (props: SVGProps<SVGSVGElement>) => (
  <IconBase {...props}>
    <path d="m12 2 1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
  </IconBase>
);

// ─── Stat Card ──────────────────────────────────────────────────────────────

const StatCardWrapper = styled(motion.div)<{ $accent?: string }>`
  background: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: ${theme.radius.lg};
  padding: 20px 22px;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${({ $accent }) => $accent || theme.colors.primary};
    opacity: 0.04;
    transform: translate(20px, -20px);
  }
`;

const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: ${theme.colors.textHint};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px;
`;

const StatValue = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 26px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  line-height: 1;
  margin-bottom: 8px;
`;

const StatDelta = styled.span<{ $positive?: boolean; $negative?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: ${theme.radius.full};
  ${({ $positive }) =>
    $positive &&
    css`
      background: ${theme.colors.successLight};
      color: ${theme.colors.success};
    `}
  ${({ $negative }) =>
    $negative &&
    css`
      background: ${theme.colors.dangerLight};
      color: ${theme.colors.danger};
    `}
	${({ $positive, $negative }) =>
    !$positive &&
    !$negative &&
    css`
      background: ${theme.colors.divider};
      color: ${theme.colors.textSecondary};
    `}
`;

const StatIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.radius.md};
  background: ${({ $color }) => $color || theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  color: ${theme.colors.textPrimary};

  svg {
    width: 18px;
    height: 18px;
  }
`;

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  iconColor?: string;
  accentColor?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  delta,
  deltaType,
  icon,
  iconColor,
  accentColor,
  delay = 0,
}: StatCardProps) {
  return (
    <StatCardWrapper
      $accent={accentColor}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {icon && <StatIcon $color={iconColor}>{icon}</StatIcon>}
      <StatLabel>{label}</StatLabel>
      <StatValue>{value}</StatValue>
      {delta && (
        <StatDelta
          $positive={deltaType === "positive"}
          $negative={deltaType === "negative"}
        >
          {deltaType === "positive" ? "↑" : deltaType === "negative" ? "↓" : ""}{" "}
          {delta}
        </StatDelta>
      )}
    </StatCardWrapper>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────

const badgeConfig = {
  paid: {
    bg: theme.colors.successLight,
    color: theme.colors.success,
    dot: theme.colors.success,
  },
  pending: {
    bg: theme.colors.warningLight,
    color: theme.colors.warning,
    dot: theme.colors.warning,
  },
  overdue: {
    bg: theme.colors.dangerLight,
    color: theme.colors.danger,
    dot: theme.colors.danger,
  },
  refunded: { bg: "#F1F5F9", color: "#475569", dot: "#94A3B8" },
  active: {
    bg: theme.colors.successLight,
    color: theme.colors.success,
    dot: theme.colors.success,
  },
  inactive: { bg: "#F1F5F9", color: "#64748B", dot: "#94A3B8" },
  draft: { bg: "#F8FAFC", color: "#64748B", dot: "#CBD5E1" },
};

type BadgeStatus = keyof typeof badgeConfig;

const BadgeWrapper = styled.span<{ $status: BadgeStatus }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: ${theme.radius.full};
  font-size: 11px;
  font-weight: 600;
  font-family: ${theme.fonts.mono};
  letter-spacing: 0.3px;
  background: ${({ $status }) => badgeConfig[$status]?.bg || "#F1F5F9"};
  color: ${({ $status }) => badgeConfig[$status]?.color || "#64748B"};
`;

const BadgeDot = styled.span<{ $status: BadgeStatus }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${({ $status }) => badgeConfig[$status]?.dot || "#94A3B8"};
  flex-shrink: 0;
`;

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <BadgeWrapper $status={status}>
      <BadgeDot $status={status} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </BadgeWrapper>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────

const PageHeaderWrapper = styled.div`
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin: 0 0 4px;
  letter-spacing: -0.3px;
`;

const PageSubtitle = styled.p`
  font-size: 13.5px;
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const PageHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <PageHeaderWrapper>
      <PageHeaderRow>
        <div>
          <PageTitle>{title}</PageTitle>
          {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
        </div>
        {action}
      </PageHeaderRow>
    </PageHeaderWrapper>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export const Card = styled.div`
  background: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: ${theme.radius.lg};
  overflow: hidden;
`;

export const CardHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${theme.colors.divider};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const CardTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

export const CardBody = styled.div`
  padding: 20px;
`;

// ─── Amount Text ──────────────────────────────────────────────────────────────

export const MonoAmount = styled.span<{ $size?: string; $weight?: string }>`
  font-family: ${theme.fonts.mono};
  font-size: ${({ $size }) => $size || "14px"};
  font-weight: ${({ $weight }) => $weight || "500"};
  color: ${theme.colors.textPrimary};
`;

// ─── Avatar ───────────────────────────────────────────────────────────────────

const avatarColors = [
  { bg: "#EEF2FF", color: "#6366F1" },
  { bg: "#F0FDF4", color: "#16A34A" },
  { bg: "#FFF7ED", color: "#EA580C" },
  { bg: "#FDF4FF", color: "#A21CAF" },
  { bg: "#EFF6FF", color: "#2563EB" },
  { bg: "#FFF1F2", color: "#E11D48" },
];

function getAvatarColor(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

const AvatarWrapper = styled.div<{
  $bg: string;
  $color: string;
  $size?: string;
}>`
  width: ${({ $size }) => $size || "32px"};
  height: ${({ $size }) => $size || "32px"};
  border-radius: 50%;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  letter-spacing: 0.3px;
`;

export function InitialsAvatar({
  name,
  size,
}: {
  name: string;
  size?: string;
}) {
  const { bg, color } = getAvatarColor(name);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <AvatarWrapper $bg={bg} $color={color} $size={size}>
      {initials}
    </AvatarWrapper>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyWrapper = styled.div`
  text-align: center;
  padding: 48px 20px;
  color: ${theme.colors.textHint};
`;

const EmptyIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  opacity: 0.55;
  color: ${theme.colors.textSecondary};

  svg {
    width: 32px;
    height: 32px;
  }
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 4px;
  font-weight: 500;
`;

const EmptySub = styled.p`
  font-size: 12px;
  color: ${theme.colors.textHint};
  margin: 0;
`;

export function EmptyState({
  icon,
  text,
  sub,
}: {
  icon?: ReactNode;
  text: string;
  sub?: string;
}) {
  return (
    <EmptyWrapper>
      {icon && <EmptyIcon>{icon}</EmptyIcon>}
      <EmptyText>{text}</EmptyText>
      {sub && <EmptySub>{sub}</EmptySub>}
    </EmptyWrapper>
  );
}
