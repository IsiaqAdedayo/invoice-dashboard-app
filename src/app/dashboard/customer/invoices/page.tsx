/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CalendarIcon,
  DocumentIcon,
  EmptyState,
  EyeIcon,
  PageHeader,
  SearchIcon,
  StatusBadge,
  WarningIcon,
} from "@/components/ui";
import { usePayInvoice } from "@/hooks/mutations/usePayInvoice";
import { useMyInvoices } from "@/hooks/queries/useMyInvoices";
import { downloadInvoicePdf } from "@/services/invoice.service";
import { theme } from "@/styles/theme";
import { Input, Select } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";

// ─── Styled ───────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchInput = styled(Input)`
  max-width: 280px;
  border-radius: 9px !important;
  height: 38px;
  font-family: ${theme.fonts.sans} !important;
  font-size: 13.5px !important;
`;

const FilterSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 9px !important;
    height: 38px !important;
    font-family: ${theme.fonts.sans} !important;
    font-size: 13px !important;
    align-items: center !important;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 14px;
`;

const InvCard = styled(motion.div)`
  background: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 6px 24px rgba(15, 17, 23, 0.08);
  }
`;

const InvCardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;
const InvCardId = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 12px;
  color: ${theme.colors.textHint};
`;
const InvCardFrom = styled.div`
  font-size: 13px;
  color: ${theme.colors.textSecondary};
  margin-top: 2px;
`;
const InvCardAmount = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 26px;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  letter-spacing: -0.5px;
`;
const InvCardMeta = styled.div`
  font-size: 12px;
  color: ${theme.colors.textHint};
`;
const InvCardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const PayBtn = styled(motion.button)<{ $status: string }>`
  height: 36px;
  padding: 0 16px;
  background: ${({ $status }) =>
    $status === "pending"
      ? theme.colors.primary
      : $status === "overdue"
        ? theme.colors.danger
        : "transparent"};
  color: ${({ $status }) =>
    $status === "pending" || $status === "overdue"
      ? "#fff"
      : theme.colors.textSecondary};
  border: 1px solid
    ${({ $status }) =>
      $status === "pending" || $status === "overdue"
        ? "transparent"
        : theme.colors.cardBorder};
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  box-shadow: ${({ $status }) =>
    $status === "pending" ? theme.shadow.indigo : "none"};
`;

const PDFBtn = styled.button`
  height: 36px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 9px;
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  &:hover {
    background: ${theme.colors.divider};
  }
`;

const ViewBtn = styled.button`
  height: 36px;
  padding: 0 12px;
  background: ${theme.colors.primary};
  border: none;
  border-radius: 9px;
  font-size: 12px;
  color: #fff;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: ${theme.colors.primaryHover || "#6366F1"};
  }
`;

const DueChip = styled.span<{ $overdue?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ $overdue }) =>
    $overdue ? theme.colors.dangerLight : theme.colors.divider};
  color: ${({ $overdue }) =>
    $overdue ? theme.colors.danger : theme.colors.textSecondary};
`;

// Modal
const Overlay = styled(motion.div)`
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
  border-radius: 18px;
  width: 100%;
  max-width: 380px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(15, 17, 23, 0.2);
`;

const ModalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid ${theme.colors.divider};
  font-size: 13.5px;
  &:last-of-type {
    border: none;
  }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

type Status = "paid" | "pending" | "overdue" | "refunded";

interface Inv {
  id: string;
  from: string;
  amount: number;
  amountFmt: string;
  status: Status;
  issued: string;
  due: string;
  dueDate: Date;
}

const INVOICES: Inv[] = [
  {
    id: "INV-2410",
    from: "Recce Solutions Ltd",
    amount: 150000,
    amountFmt: "₦150,000",
    status: "pending",
    issued: "Apr 18, 2026",
    due: "May 2, 2026",
    dueDate: new Date("2026-05-02"),
  },
  {
    id: "INV-2405",
    from: "Recce Solutions Ltd",
    amount: 128000,
    amountFmt: "₦128,000",
    status: "pending",
    issued: "Apr 8, 2026",
    due: "Apr 22, 2026",
    dueDate: new Date("2026-04-22"),
  },
  {
    id: "INV-2402",
    from: "Recce Solutions Ltd",
    amount: 72500,
    amountFmt: "₦72,500",
    status: "pending",
    issued: "Apr 14, 2026",
    due: "Apr 28, 2026",
    dueDate: new Date("2026-04-28"),
  },
  {
    id: "INV-2403",
    from: "Recce Solutions Ltd",
    amount: 310000,
    amountFmt: "₦310,000",
    status: "overdue",
    issued: "Mar 28, 2026",
    due: "Apr 12, 2026",
    dueDate: new Date("2026-04-12"),
  },
  {
    id: "INV-2401",
    from: "Recce Solutions Ltd",
    amount: 185000,
    amountFmt: "₦185,000",
    status: "paid",
    issued: "Apr 15, 2026",
    due: "Apr 30, 2026",
    dueDate: new Date("2026-04-30"),
  },
  {
    id: "INV-2399",
    from: "Recce Solutions Ltd",
    amount: 95000,
    amountFmt: "₦95,000",
    status: "paid",
    issued: "Mar 20, 2026",
    due: "Apr 4, 2026",
    dueDate: new Date("2026-04-04"),
  },
  {
    id: "INV-2397",
    from: "Recce Solutions Ltd",
    amount: 68000,
    amountFmt: "₦68,000",
    status: "paid",
    issued: "Feb 14, 2026",
    due: "Mar 1, 2026",
    dueDate: new Date("2026-03-01"),
  },
  {
    id: "INV-2396",
    from: "Recce Solutions Ltd",
    amount: 44000,
    amountFmt: "₦44,000",
    status: "refunded",
    issued: "Mar 5, 2026",
    due: "Mar 20, 2026",
    dueDate: new Date("2026-03-20"),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerInvoicesPage() {
  const router = useRouter();
  const { data } = useSession();
  const userName = data?.user?.name || "User";
  const { data: invoicesData } = useMyInvoices((data?.user as any)?.customerId);
  const invoices = invoicesData || [];

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [paying, setPaying] = useState<any>(null);

  const { mutateAsync: payInvoice } = usePayInvoice();

  const filtered = invoices.filter((inv) => {
    const matchS =
      !search || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchF = filter === "all" || inv.status === filter;
    return matchS && matchF;
  });

  const pendingFiltered = filtered.filter(
    (i) => i.status === "pending" || i.status === "overdue",
  );
  const paidFiltered = filtered.filter(
    (i) => i.status === "paid" || i.status === "refunded",
  );

  const confirmPay = async () => {
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

  const isOverdue = (inv: any) =>
    inv.status === "overdue" ||
    (inv.status === "pending" && inv.dueDate < new Date());

  const renderCard = (inv: any) => (
    <InvCard
      key={inv.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <InvCardTop>
        <div>
          <InvCardId>{inv.id}</InvCardId>
          <InvCardFrom>{inv.customerName || "Recce Solutions Ltd"}</InvCardFrom>
        </div>
        <StatusBadge status={inv.status} />
      </InvCardTop>

      <div>
        <InvCardAmount>{inv.amountFmt}</InvCardAmount>
        <InvCardMeta>Issued {inv.issued}</InvCardMeta>
      </div>

      <InvCardFooter>
        <DueChip $overdue={isOverdue(inv)}>
          {isOverdue(inv) ? (
            <WarningIcon style={{ width: 12, height: 12 }} />
          ) : (
            <CalendarIcon style={{ width: 12, height: 12 }} />
          )}
          Due {inv.due}
        </DueChip>
        <div style={{ display: "flex", gap: 7 }}>
          <ViewBtn
            onClick={() =>
              router.push(`/dashboard/customer/invoices/${inv.publicId}`)
            }
          >
            <EyeIcon style={{ width: 12, height: 12 }} />
            View
          </ViewBtn>
          <PDFBtn onClick={() => downloadInvoicePdf(inv.publicId)}>
            ↓ PDF
          </PDFBtn>
          {(inv.status === "pending" || inv.status === "overdue") && (
            <PayBtn
              $status={inv.status}
              onClick={() => setPaying(inv)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Pay now
            </PayBtn>
          )}
        </div>
      </InvCardFooter>
    </InvCard>
  );

  return (
    <DashboardLayout role="customer" userName={userName}>
      <PageHeader
        title="My Invoices"
        subtitle="View and pay your outstanding invoices."
      />

      <Toolbar>
        <SearchInput
          placeholder="Search by invoice ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          prefix={
            <SearchIcon
              style={{ color: theme.colors.textHint, width: 16, height: 16 }}
            />
          }
        />
        <FilterSelect
          value={filter}
          onChange={(v: any) => setFilter(v)}
          style={{ width: 150 }}
          options={[
            { value: "all", label: "All invoices" },
            { value: "pending", label: "Pending" },
            { value: "overdue", label: "Overdue" },
            { value: "paid", label: "Paid" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
      </Toolbar>

      {pendingFiltered.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.textSecondary,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Action required · {pendingFiltered.length} invoice
            {pendingFiltered.length > 1 ? "s" : ""}
          </div>
          <CardGrid>{pendingFiltered.map(renderCard)}</CardGrid>
        </div>
      )}

      {paidFiltered.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: theme.colors.textSecondary,
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            History · {paidFiltered.length} invoice
            {paidFiltered.length > 1 ? "s" : ""}
          </div>
          <CardGrid>
            {paidFiltered.map((inv) => (
              <InvCard
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ opacity: 0.75 }}
                layout
              >
                <InvCardTop>
                  <div>
                    <InvCardId>{inv.id}</InvCardId>
                    <InvCardFrom>
                      {inv.customerName || "Recce Solutions Ltd"}
                    </InvCardFrom>
                  </div>
                  <StatusBadge status={inv.status} />
                </InvCardTop>
                <div>
                  <InvCardAmount style={{ fontSize: 22 }}>
                    {inv.amountFmt}
                  </InvCardAmount>
                  <InvCardMeta>Issued {inv.issued}</InvCardMeta>
                </div>
                <InvCardFooter>
                  <span style={{ fontSize: 12, color: theme.colors.textHint }}>
                    Due {inv.due}
                  </span>
                  <PDFBtn onClick={() => downloadInvoicePdf(inv.publicId)}>
                    ↓ PDF
                  </PDFBtn>
                </InvCardFooter>
              </InvCard>
            ))}
          </CardGrid>
        </div>
      )}

      {filtered.length === 0 && (
        <EmptyState
          icon={<DocumentIcon />}
          text="No invoices found"
          sub="Try adjusting your search or filters"
        />
      )}

      {/* Pay Modal */}
      <AnimatePresence>
        {paying && (
          <Overlay
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
              <div style={{ fontSize: 30, marginBottom: 14 }}>🔐</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                Confirm payment
              </div>
              <div
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: 13,
                  marginBottom: 20,
                }}
              >
                You&apos;re about to pay{" "}
                {paying.customerName || "Recce Solutions Ltd"}
              </div>

              <div
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: 34,
                  fontWeight: 800,
                  color: theme.colors.primary,
                  marginBottom: 20,
                }}
              >
                {paying.amountFmt}
              </div>

              <ModalRow>
                <span style={{ color: theme.colors.textSecondary }}>
                  Invoice
                </span>
                <span style={{ fontFamily: theme.fonts.mono, fontWeight: 600 }}>
                  {paying.id}
                </span>
              </ModalRow>
              <ModalRow>
                <span style={{ color: theme.colors.textSecondary }}>Due</span>
                <span style={{ fontWeight: 500 }}>{paying.due}</span>
              </ModalRow>
              <ModalRow>
                <span style={{ color: theme.colors.textSecondary }}>
                  Method
                </span>
                <span style={{ fontWeight: 500 }}>Bank transfer</span>
              </ModalRow>

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  onClick={() => setPaying(null)}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: `1px solid ${theme.colors.cardBorder}`,
                    background: "transparent",
                    fontSize: 14,
                    fontFamily: theme.fonts.sans,
                    cursor: "pointer",
                    color: theme.colors.textSecondary,
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={confirmPay}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 10,
                    border: "none",
                    background: theme.colors.success,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: theme.fonts.sans,
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
                  }}
                >
                  Pay {paying.amountFmt}
                </motion.button>
              </div>
            </ModalBox>
          </Overlay>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
