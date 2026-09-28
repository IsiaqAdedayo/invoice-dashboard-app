/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CheckIcon,
  ClockIcon,
  InitialsAvatar,
  MonoAmount,
  PageHeader,
  StatCard,
  StatusBadge,
  WalletIcon,
  WarningIcon,
} from "@/components/ui";
import { useAdminOverview } from "@/hooks/queries/useAdminOverview";
import { useRecentInvoices } from "@/hooks/queries/useRecentInvoices";
import { useRevenueChart } from "@/hooks/queries/useRevenueChart";
import { useWeeklyChart } from "@/hooks/queries/useWeeklyChart";
import { theme } from "@/styles/theme";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Key } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styled from "styled-components";

// ─── Styled ───────────────────────────────────────────────────────────────────

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 16px;
  margin-bottom: 22px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ChartWrapper = styled.div`
  height: 210px;
  margin-top: 8px;
`;

const TooltipBox = styled.div`
  background: ${theme.colors.sidebarBg};
  border: 1px solid ${theme.colors.sidebarBorder};
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #fff;
  font-family: ${theme.fonts.mono};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid ${theme.colors.divider};
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #fafbff;
  }
`;

const ActivityDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
  margin-top: 5px;
`;

const ActivityText = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  margin-bottom: 2px;
`;

const ActivityMeta = styled.div`
  font-size: 12px;
  color: ${theme.colors.textHint};
`;

const ActivityAmount = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  flex-shrink: 0;
`;

const TopCustomerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 20px;
  border-bottom: 1px solid ${theme.colors.divider};
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #fafbff;
  }
`;

const ProgressBar = styled.div<{ $pct: number; $color: string }>`
  flex: 1;
  height: 4px;
  background: ${theme.colors.divider};
  border-radius: 2px;
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${({ $color }) => $color};
    border-radius: 2px;
    transition: width 1s ease;
  }
`;

// ─── Mock data (Activity only) ────────────────────────────────────────────────

const activity = [
  {
    title: "INV-2407 paid by Apex Group",
    meta: "2 minutes ago",
    amount: "₦97,500",
    color: theme.colors.success,
  },
  {
    title: "INV-2408 overdue — Lumi Labs",
    meta: "15 minutes ago",
    amount: "₦230,000",
    color: theme.colors.danger,
  },
  {
    title: "New customer: BluePath Ltd",
    meta: "1 hour ago",
    amount: "",
    color: theme.colors.info,
  },
  {
    title: "INV-2405 viewed by BluePath",
    meta: "2 hours ago",
    amount: "₦128,000",
    color: theme.colors.warning,
  },
  {
    title: "INV-2404 paid by Zenith Fin",
    meta: "3 hours ago",
    amount: "₦55,000",
    color: theme.colors.success,
  },
];

const invoiceColumns: ColumnsType<any> = [
  {
    title: "Invoice",
    dataIndex: "id",
    render: (id) => (
      <span
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: 12,
          color: theme.colors.textSecondary,
        }}
      >
        {id}
      </span>
    ),
    width: 110,
  },
  {
    title: "Customer",
    dataIndex: "customerName",
    render: (name) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <InitialsAvatar name={name} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
      </div>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amountFmt",
    render: (v) => <MonoAmount $weight="600">{v}</MonoAmount>,
    width: 120,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s) => <StatusBadge status={s} />,
    width: 110,
  },
  {
    title: "Due date",
    dataIndex: "dueFmt",
    render: (d) => (
      <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
        {d}
      </span>
    ),
    width: 120,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <div style={{ marginBottom: 4, color: "rgba(255,255,255,0.5)" }}>
        {label}
      </div>
      <div>
        Revenue <span style={{ color: "#818CF8" }}>₦{payload[0]?.value}k</span>
      </div>
    </TooltipBox>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data } = useSession();
  const userName = data?.user?.name || "User";

  const { data: overview } = useAdminOverview();
  const { data: recentInvoices } = useRecentInvoices();
  const { data: revenueData } = useRevenueChart();
  const { data: barData } = useWeeklyChart();
  return (
    <DashboardLayout role="admin" userName={userName}>
      <PageHeader
        title="Dashboard"
        subtitle={`Good morning, ${userName} — here's your financial snapshot.`}
      />

      {/* Stat cards */}
      <Grid>
        <StatCard
          label="Total revenue"
          value={`₦${(overview?.totalRevenue || 0).toLocaleString()}`}
          delta={`${overview?.revenueDeltaPct > 0 ? "↑" : "↓"} ${Math.abs(overview?.revenueDeltaPct || 0)}% this month`}
          deltaType={overview?.revenueDeltaPct >= 0 ? "positive" : "negative"}
          icon={<WalletIcon />}
          iconColor={theme.colors.primaryLight}
          delay={0}
        />
        <StatCard
          label="Collected"
          value={`₦${(overview?.collected || 0).toLocaleString()}`}
          delta=""
          deltaType="positive"
          icon={<CheckIcon />}
          iconColor={theme.colors.successLight}
          delay={0.05}
        />
        <StatCard
          label="Outstanding"
          value={`₦${(overview?.outstanding || 0).toLocaleString()}`}
          delta=""
          deltaType="neutral"
          icon={<ClockIcon />}
          iconColor={theme.colors.warningLight}
          delay={0.1}
        />
        <StatCard
          label="Overdue"
          value={overview?.overdueCount || 0}
          delta=""
          deltaType="negative"
          icon={<WarningIcon />}
          iconColor={theme.colors.dangerLight}
          delay={0.15}
        />
      </Grid>

      {/* Charts row */}
      <ChartsRow>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue overview</CardTitle>
              <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                Last 6 months in ₦ thousands
              </span>
            </div>
          </CardHeader>
          <div style={{ padding: "0 8px 16px" }}>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData || []}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={theme.colors.primary}
                        stopOpacity={0.12}
                      />
                      <stop
                        offset="95%"
                        stopColor={theme.colors.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.colors.divider}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: theme.colors.textHint }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.colors.textHint }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₦${v}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.colors.primary}
                    strokeWidth={2}
                    fill="url(#grad)"
                    dot={{ r: 3, fill: theme.colors.primary }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoices this week</CardTitle>
              <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                Daily paid count
              </span>
            </div>
          </CardHeader>
          <div style={{ padding: "0 8px 16px" }}>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData || []}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.colors.divider}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: theme.colors.textHint }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: theme.colors.textHint }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "rgba(99,102,241,0.04)" }} />
                  <Bar dataKey="paid" radius={[5, 5, 0, 0]}>
                    {(barData || []).map(
                      (_: any, i: Key | null | undefined) => (
                        <Cell
                          key={i}
                          fill={
                            i === (barData?.length || 1) - 1
                              ? theme.colors.primary
                              : theme.colors.primaryBorder
                          }
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </Card>
      </ChartsRow>

      {/* Bottom row — recent invoices + activity */}
      <BottomRow>
        <Card>
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
            <Link
              href="/dashboard/admin/invoices"
              style={{
                fontSize: 12,
                color: theme.colors.primary,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View all →
            </Link>
          </CardHeader>
          <Table
            columns={invoiceColumns}
            dataSource={
              recentInvoices?.map((inv: any, i: number) => ({
                ...inv,
                key: i,
              })) || []
            }
            pagination={false}
            size="small"
            style={{ borderTop: "none" }}
          />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Activity feed */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <ActivityList>
              {activity.map((a, i) => (
                <ActivityItem key={i}>
                  <ActivityDot $color={a.color} />
                  <ActivityText>
                    <ActivityTitle>{a.title}</ActivityTitle>
                    <ActivityMeta>{a.meta}</ActivityMeta>
                  </ActivityText>
                  {a.amount && <ActivityAmount>{a.amount}</ActivityAmount>}
                </ActivityItem>
              ))}
            </ActivityList>
          </Card>

          {/* Top customers */}
          <Card>
            <CardHeader>
              <CardTitle>Top customers</CardTitle>
            </CardHeader>
            {overview?.topCustomers?.map((c: any, i: number) => (
              <TopCustomerRow key={i}>
                <InitialsAvatar name={c.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{ fontSize: 13, fontWeight: 500, marginBottom: 5 }}
                  >
                    {c.name}
                  </div>
                  <ProgressBar $pct={c.pct} $color={theme.colors.primary} />
                </div>
                <MonoAmount $size="13px" $weight="600">
                  {c.totalFmt}
                </MonoAmount>
              </TopCustomerRow>
            ))}
          </Card>
        </div>
      </BottomRow>
    </DashboardLayout>
  );
}
