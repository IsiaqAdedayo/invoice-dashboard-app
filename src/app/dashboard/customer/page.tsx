/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CheckIcon,
  ClockIcon,
  DocumentIcon,
  MonoAmount,
  PageHeader,
  StatCard,
  StatusBadge,
  WalletIcon,
} from "@/components/ui";
import { usePayInvoice } from "@/hooks/mutations/usePayInvoice";
import { useMyInvoices } from "@/hooks/queries/useMyInvoices";
import { theme } from "@/styles/theme";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styled from "styled-components";

// ─── Styled ───────────────────────────────────────────────────────────────────

const Grid4 = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const InvoiceList = styled.div`
  display: flex;
  flex-direction: column;
`;

const InvoiceRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  border-bottom: 1px solid ${theme.colors.divider};
  transition: background 0.15s;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #fafbff;
  }
`;

const InvInfo = styled.div`
  flex: 1;
  min-width: 0;
`;
const InvId = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 12px;
  color: ${theme.colors.textHint};
  margin-bottom: 2px;
`;
const InvCompany = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;
const InvDate = styled.div`
  font-size: 12px;
  color: ${theme.colors.textHint};
`;
const InvRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
`;

const PayBtn = styled(motion.button)`
  height: 30px;
  padding: 0 14px;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
`;

const PDFBtn = styled.button`
  height: 30px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 7px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  &:hover {
    background: ${theme.colors.divider};
  }
`;

// Modal
const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(15, 17, 23, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalBox = styled(motion.div)`
  background: ${theme.colors.cardBg};
  border-radius: 16px;
  width: 100%;
  max-width: 380px;
  padding: 28px;
  box-shadow: ${theme.shadow.lg};
`;

const ModalTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  letter-spacing: -0.2px;
`;
const ModalSub = styled.p`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin: 0 0 20px;
`;

const ModalAmount = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.primary};
  margin-bottom: 20px;
`;

const ModalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${theme.colors.divider};
  font-size: 13px;

  &:last-of-type {
    border-bottom: none;
  }
`;

const ModalKey = styled.span`
  color: ${theme.colors.textSecondary};
`;
const ModalVal = styled.span`
  font-weight: 500;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  button {
    flex: 1;
    height: 44px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    font-family: ${theme.fonts.sans};
    cursor: pointer;
  }
`;

const CancelBtn = styled.button`
  border: 1px solid ${theme.colors.cardBorder};
  background: transparent;
  color: ${theme.colors.textSecondary};
`;
const ConfirmBtn = styled(motion.button)`
  background: ${theme.colors.success};
  border: none;
  color: #fff;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const spendData = [
  { month: "Nov", spent: 45 },
  { month: "Dec", spent: 185 },
  { month: "Jan", spent: 0 },
  { month: "Feb", spent: 95 },
  { month: "Mar", spent: 44 },
  { month: "Apr", spent: 200 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerDashboard() {
  const { data: sessionData } = useSession();
  const userName = sessionData?.user?.name || "User";
  const customerId =
    (sessionData?.user as any)?.customerId || sessionData?.user?.id;

  const { data: myInvoicesResponse } = useMyInvoices(customerId as string);
  const invoices = Array.isArray(myInvoicesResponse)
    ? myInvoicesResponse
    : myInvoicesResponse?.data || [];

  const [paying, setPaying] = useState<any | null>(null);

  const totalBilled = invoices.reduce(
    (s: number, i: any) => s + (Number(i.totalAmount) || 0),
    0,
  );
  const totalPaid = invoices
    .filter((i: any) => i.status === "paid")
    .reduce((s: number, i: any) => s + (Number(i.totalAmount) || 0), 0);
  const pendingCount = invoices.filter(
    (i: any) => i.status === "pending",
  ).length;
  const pendingAmount = invoices
    .filter((i: any) => i.status === "pending")
    .reduce((s: number, i: any) => s + (Number(i.totalAmount) || 0), 0);

  const { mutateAsync: payInvoice } = usePayInvoice();

  const confirmPayment = async () => {
    if (!paying) return;
    try {
      await payInvoice({
        id: paying.publicId,
        amount: Number(paying.totalAmount),
      });
      setPaying(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout role="customer" userName={userName}>
      <PageHeader
        title="My Dashboard"
        subtitle="Welcome back — here's your billing overview."
      />

      <Grid4>
        <StatCard
          label="Total billed"
          value={`₦${(totalBilled / 1000).toFixed(0)}k`}
          delta="all time"
          deltaType="neutral"
          icon={<WalletIcon />}
          delay={0}
        />
        <StatCard
          label="Paid"
          value={`₦${(totalPaid / 1000).toFixed(0)}k`}
          delta="on time"
          deltaType="positive"
          icon={<CheckIcon />}
          delay={0.05}
        />
        <StatCard
          label="Pending"
          value={String(pendingCount)}
          delta={`₦${(pendingAmount / 1000).toFixed(0)}k outstanding`}
          deltaType="neutral"
          icon={<ClockIcon />}
          delay={0.1}
        />
        <StatCard
          label="My invoices"
          value={String(invoices.length)}
          delta="total"
          deltaType="neutral"
          icon={<DocumentIcon />}
          delay={0.15}
        />
      </Grid4>

      <TwoCol>
        {/* Invoice list */}
        <Card>
          <CardHeader>
            <CardTitle>My invoices</CardTitle>
            <a
              href="/customer/invoices"
              style={{
                fontSize: 12,
                color: theme.colors.primary,
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View all →
            </a>
          </CardHeader>
          <InvoiceList>
            {invoices.slice(0, 5).map((inv) => (
              <InvoiceRow key={inv.id}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    background: theme.colors.primaryLight,
                    borderRadius: 9,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: theme.colors.textPrimary,
                  }}
                >
                  <DocumentIcon style={{ width: 16, height: 16 }} />
                </div>
                <InvInfo>
                  <InvId>{inv.id}</InvId>
                  <InvCompany>
                    {inv.customerName || "Recce Solutions Ltd"}
                  </InvCompany>
                  <InvDate>Due {inv.dueFmt}</InvDate>
                </InvInfo>
                <InvRight>
                  <MonoAmount $weight="600">{inv.amountFmt}</MonoAmount>
                  <StatusBadge status={inv.status as any} />
                  {inv.status === "pending" && (
                    <PayBtn
                      onClick={() => setPaying(inv)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Pay now
                    </PayBtn>
                  )}
                </InvRight>
              </InvoiceRow>
            ))}
          </InvoiceList>
        </Card>

        {/* Spend chart + quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Spend over time</CardTitle>
                <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                  ₦ thousands
                </span>
              </div>
            </CardHeader>
            <div style={{ height: 180, padding: "0 8px 16px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendData}>
                  <defs>
                    <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
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
                  <Tooltip formatter={(v: any) => `₦${v}k`} />
                  <Area
                    type="monotone"
                    dataKey="spent"
                    stroke={theme.colors.primary}
                    strokeWidth={2}
                    fill="url(#gS)"
                    dot={{ r: 3, fill: theme.colors.primary }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <div
              style={{
                padding: "12px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {[
                {
                  icon: "📥",
                  label: "Download all invoices",
                  sub: "Export as ZIP",
                },
                {
                  icon: "📧",
                  label: "Email support",
                  sub: "support@payvance.io",
                },
                {
                  icon: "🔔",
                  label: "Payment reminders",
                  sub: "Manage notifications",
                },
              ].map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: `1px solid ${theme.colors.cardBorder}`,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {a.label}
                    </div>
                    <div style={{ fontSize: 12, color: theme.colors.textHint }}>
                      {a.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </TwoCol>

      {/* Pay Modal */}
      <AnimatePresence>
        {paying && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPaying(null)}
          >
            <ModalBox
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>🔐</div>
              <ModalTitle>Confirm payment</ModalTitle>
              <ModalSub>Review the details before proceeding</ModalSub>
              <ModalAmount>{paying.amountFmt}</ModalAmount>

              <ModalRow>
                <ModalKey>Invoice</ModalKey>
                <ModalVal style={{ fontFamily: theme.fonts.mono }}>
                  {paying.id}
                </ModalVal>
              </ModalRow>
              <ModalRow>
                <ModalKey>To</ModalKey>
                <ModalVal>
                  {paying.customerName || "Recce Solutions Ltd"}
                </ModalVal>
              </ModalRow>
              <ModalRow>
                <ModalKey>Due date</ModalKey>
                <ModalVal>{paying.dueFmt}</ModalVal>
              </ModalRow>
              <ModalRow>
                <ModalKey>Method</ModalKey>
                <ModalVal>Bank transfer</ModalVal>
              </ModalRow>

              <ModalActions>
                <CancelBtn onClick={() => setPaying(null)}>Cancel</CancelBtn>
                <ConfirmBtn
                  onClick={confirmPayment}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Pay {paying.amountFmt}
                </ConfirmBtn>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
