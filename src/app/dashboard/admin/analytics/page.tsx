/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  ClockIcon,
  PageHeader,
  StatCard,
  TargetIcon,
  TrendingUpIcon,
  UndoIcon,
} from "@/components/ui";
import { useFullAnalytics } from "@/hooks/queries/useFullAnalytics";
import { theme } from "@/styles/theme";
import { Select } from "antd";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styled from "styled-components";

const Grid4 = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const FullGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ChartWrap = styled.div<{ $h?: number }>`
  height: ${({ $h }) => $h || 220}px;
  padding: 4px 8px 8px;
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

const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 8px 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
`;

const LegendDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

// ─── Mock data ────────────────────────────────────────────────────────────────

// ─── Mock data (for fields not in API) ────────────────────────────────────────────────

const methodData = [
  { name: "Bank transfer", value: 52, color: theme.colors.primary },
  { name: "Card", value: 28, color: "#10B981" },
  { name: "USSD", value: 12, color: "#F59E0B" },
  { name: "Crypto", value: 8, color: "#94A3B8" },
];

const topCategories = [
  { cat: "SaaS", amount: 1850, color: theme.colors.primary },
  { cat: "Consulting", amount: 1240, color: "#10B981" },
  { cat: "Design", amount: 760, color: "#F59E0B" },
  { cat: "Dev", amount: 520, color: "#3B82F6" },
  { cat: "Other", amount: 230, color: "#94A3B8" },
];

const CustomTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>
        {label}
      </div>
      {payload.map((p: any, i: number) => (
        <div key={i}>
          {p.name} <span style={{ color: "#818CF8" }}>₦{p.value}k</span>
        </div>
      ))}
    </TooltipBox>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { data: sessionData } = useSession();
  const userName = sessionData?.user?.name || "User";
  const { data: analytics } = useFullAnalytics();

  const formattedAgeData =
    analytics?.ageData?.map((a: any) => ({
      age: a.range,
      count: a.count,
    })) || [];
  return (
    <DashboardLayout role="admin" userName={userName}>
      <PageHeader
        title="Analytics"
        subtitle="Revenue trends, collection rates, and payment insights."
        action={
          <Select
            defaultValue="12mo"
            style={{ width: 130 }}
            options={[
              { value: "1mo", label: "Last month" },
              { value: "3mo", label: "Last 3 months" },
              { value: "6mo", label: "Last 6 months" },
              { value: "12mo", label: "Last 12 months" },
            ]}
            styles={{ popup: { root: { fontFamily: theme.fonts.sans } } }}
          />
        }
      />

      <Grid4>
        <StatCard
          label="Success rate"
          value={`${analytics?.successRate?.toFixed(1) || 0}%`}
          delta=""
          deltaType="positive"
          icon={<TargetIcon />}
          delay={0}
        />
        <StatCard
          label="Avg invoice"
          value={`₦${((analytics?.avgInvoice || 0) / 1000).toFixed(0)}k`}
          delta=""
          deltaType="positive"
          icon={<TrendingUpIcon />}
          delay={0.05}
        />
        <StatCard
          label="Refund rate"
          value={`${analytics?.refundRate?.toFixed(1) || 0}%`}
          delta=""
          deltaType="negative"
          icon={<UndoIcon />}
          delay={0.1}
        />
        <StatCard
          label="Overdue rate"
          value={`${analytics?.overdueRate?.toFixed(1) || 0}%`}
          delta=""
          deltaType="negative"
          icon={<ClockIcon />}
          delay={0.15}
        />
      </Grid4>

      {/* Main revenue chart */}
      <ChartsGrid>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue & collections</CardTitle>
              <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                12-month trend in ₦ thousands
              </span>
            </div>
          </CardHeader>
          <LegendRow>
            <LegendItem>
              <LegendDot $color={theme.colors.primary} /> Revenue
            </LegendItem>
            <LegendItem>
              <LegendDot $color={theme.colors.danger} /> Refunds
            </LegendItem>
          </LegendRow>
          <ChartWrap $h={230}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.revenueChart || []}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
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
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={theme.colors.danger}
                      stopOpacity={0.1}
                    />
                    <stop
                      offset="95%"
                      stopColor={theme.colors.danger}
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
                <Tooltip content={<CustomTip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={theme.colors.primary}
                  strokeWidth={2}
                  fill="url(#gR)"
                  dot={{ r: 2, fill: theme.colors.primary }}
                />
                <Area
                  type="monotone"
                  dataKey="refunds"
                  name="Refunds"
                  stroke={theme.colors.danger}
                  strokeWidth={2}
                  fill="url(#gC)"
                  dot={{ r: 2, fill: theme.colors.danger }}
                  strokeDasharray="5 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrap>
        </Card>

        {/* Payment methods pie */}
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <ChartWrap $h={200}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {methodData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrap>
          <div
            style={{
              padding: "0 20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {methodData.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <LegendDot $color={m.color} style={{ borderRadius: 50 }} />
                  <span
                    style={{ fontSize: 13, color: theme.colors.textSecondary }}
                  >
                    {m.name}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {m.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </ChartsGrid>

      {/* Bottom 3 charts */}
      <FullGrid>
        {/* Success rate line */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Payment success rate</CardTitle>
              <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                % of invoices paid on time
              </span>
            </div>
          </CardHeader>
          <ChartWrap $h={180}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.successTrend || []}>
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
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: theme.colors.textHint }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip formatter={(v: any) => `${v}%`} />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke={theme.colors.success}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: theme.colors.success }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrap>
        </Card>

        {/* Invoice age */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoice age distribution</CardTitle>
              <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                Days outstanding
              </span>
            </div>
          </CardHeader>
          <ChartWrap $h={180}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedAgeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.colors.divider}
                  vertical={false}
                />
                <XAxis
                  dataKey="age"
                  tick={{ fontSize: 11, fill: theme.colors.textHint }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.colors.textHint }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {formattedAgeData.map((_, i: number) => (
                    <Cell
                      key={i}
                      fill={
                        [
                          theme.colors.primary,
                          "#818CF8",
                          "#F59E0B",
                          "#FB923C",
                          theme.colors.danger,
                        ][i]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        </Card>

        {/* Revenue by category */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Revenue by category</CardTitle>
              <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                In ₦ thousands
              </span>
            </div>
          </CardHeader>
          <ChartWrap $h={180}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCategories} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.colors.divider}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: theme.colors.textHint }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₦${v}k`}
                />
                <YAxis
                  type="category"
                  dataKey="cat"
                  tick={{ fontSize: 11, fill: theme.colors.textHint }}
                  axisLine={false}
                  tickLine={false}
                  width={65}
                />
                <Tooltip formatter={(v: any) => `₦${v}k`} />
                <Bar dataKey="amount" radius={[0, 5, 5, 0]}>
                  {topCategories.map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        </Card>
      </FullGrid>
    </DashboardLayout>
  );
}
