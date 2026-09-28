/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  DocumentIcon,
  EmptyState,
  InitialsAvatar,
  MonoAmount,
  PageHeader,
  SearchIcon,
  StatusBadge,
} from "@/components/ui";
import { useCreateInvoice } from "@/hooks/mutations/useCreateInvoice";
import { useRefundInvoice } from "@/hooks/mutations/useRefundInvoice";
import { useUpdateInvoiceStatus } from "@/hooks/mutations/useUpdateInvoiceStatus";
import { useAdminOverview } from "@/hooks/queries/useAdminOverview";
import { useInvoices } from "@/hooks/queries/useInvoices";
import { downloadInvoicePdf } from "@/services/invoice.service";
import { theme } from "@/styles/theme";
import { Input, Modal, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ErrorMessage, Field, Formik, Form as FormikForm } from "formik";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";
import * as Yup from "yup";

// ─── Styled ───────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const SearchInput = styled(Input)`
  max-width: 280px;
  border-radius: 9px !important;
  height: 38px;
  font-family: ${theme.fonts.sans} !important;
  font-size: 13.5px !important;
  border-color: ${theme.colors.cardBorder} !important;

  &:focus,
  &:hover {
    border-color: ${theme.colors.primaryBorder} !important;
  }
`;

const FilterSelect = styled(Select)`
  .ant-select-selector {
    border-radius: 9px !important;
    height: 38px !important;
    border-color: ${theme.colors.cardBorder} !important;
    font-family: ${theme.fonts.sans} !important;
    font-size: 13px !important;
    align-items: center !important;
  }
`;

const PrimaryBtn = styled.button`
  height: 38px;
  padding: 0 16px;
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  box-shadow: ${theme.shadow.indigo};
  transition: background 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const ActionBtn = styled.button<{ $variant?: "danger" | "ghost" }>`
  height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === "danger" ? "rgba(239,68,68,0.25)" : theme.colors.cardBorder};
  background: transparent;
  color: ${({ $variant }) =>
    $variant === "danger" ? theme.colors.danger : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 500;
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${({ $variant }) =>
      $variant === "danger" ? theme.colors.dangerLight : theme.colors.divider};
    color: ${({ $variant }) =>
      $variant === "danger" ? theme.colors.danger : theme.colors.textPrimary};
  }
`;

const SummaryBar = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SummaryItem = styled.div`
  background: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: ${theme.radius.md};
  padding: 12px 16px;
`;

const SummaryLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${theme.colors.textHint};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div`
  font-family: ${theme.fonts.mono};
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

// ─── New Invoice Modal ────────────────────────────────────────────────────────

const ModalField = styled.div`
  margin-bottom: 14px;
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 6px;
`;

const StyledInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  height: 40px;
  border: 1.5px solid
    ${({ $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.cardBorder};
  border-radius: 9px;
  padding: 0 12px;
  font-size: 14px;
  font-family: ${theme.fonts.sans};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.pageBg};
  outline: none;
  transition: all 0.15s;

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: ${theme.colors.cardBg};
  }
`;

const FieldErr = styled.span`
  font-size: 12px;
  color: ${theme.colors.danger};
  font-weight: 500;
  margin-top: 3px;
  display: block;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${theme.colors.divider};
`;

// ─── Types & Data ─────────────────────────────────────────────────────────────

type InvoiceStatus = "paid" | "pending" | "overdue" | "refunded";

interface Invoice {
  key: number;
  id: string;
  customer: string;
  amount: number;
  amountFmt: string;
  status: InvoiceStatus;
  date: string;
  due: string;
}

// ─── Data ─────────────────────────────────────────────────────────────

const NewInvoiceSchema = Yup.object({
  customer: Yup.string().required("Customer is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  amount: Yup.number()
    .positive("Must be positive")
    .required("Amount is required"),
  description: Yup.string().required("Description is required"),
  dueDate: Yup.string().required("Due date is required"),
});

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminInvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams?.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  const { data: overview } = useAdminOverview();
  const { data: invoicesResponse, isLoading } = useInvoices({
    search,
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit,
  });

  const { mutateAsync: createInvoice } = useCreateInvoice();
  const { mutateAsync: updateStatus } = useUpdateInvoiceStatus();
  const { mutateAsync: refundInvoice } = useRefundInvoice();

  const invoices =
    invoicesResponse?.data?.map((inv: any, i: number) => ({
      ...inv,
      key: i,
    })) || [];
  const meta = invoicesResponse?.meta || {
    total: 0,
    page: 1,
    limit,
    lastPage: 1,
  };
  const [showModal, setShowModal] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice ID",
      dataIndex: "id",
      render: (id) => (
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 12,
            color: theme.colors.textSecondary,
            fontWeight: 500,
          }}
        >
          {id}
        </span>
      ),
      width: 115,
      sorter: (a, b) => a.id.localeCompare(b.id),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      render: (name) => (
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <InitialsAvatar name={name} />
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</span>
        </div>
      ),
      sorter: (a: any, b: any) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Amount",
      dataIndex: "amountFmt",
      render: (v) => <MonoAmount $weight="600">{v}</MonoAmount>,
      width: 130,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => <StatusBadge status={s} />,
      width: 120,
      filters: [
        { text: "Paid", value: "paid" },
        { text: "Pending", value: "pending" },
        { text: "Overdue", value: "overdue" },
        { text: "Refunded", value: "refunded" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Issued",
      dataIndex: "issuedFmt",
      render: (d) => (
        <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
          {d}
        </span>
      ),
      width: 130,
    },
    {
      title: "Due",
      dataIndex: "dueFmt",
      render: (d, row) => (
        <span
          style={{
            fontSize: 13,
            color:
              row.status === "overdue"
                ? theme.colors.danger
                : theme.colors.textSecondary,
            fontWeight: row.status === "overdue" ? 600 : 400,
          }}
        >
          {d}
        </span>
      ),
      width: 130,
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, row) => (
        <Space size={6}>
          <ActionBtn
            onClick={() =>
              router.push(`/dashboard/admin/invoices/${row.publicId}`)
            }
          >
            View
          </ActionBtn>
          <ActionBtn onClick={() => downloadInvoicePdf(row.publicId)}>
            PDF
          </ActionBtn>
          {row.status === "pending" && (
            <ActionBtn
              onClick={() => updateStatus({ id: row.publicId, status: "paid" })}
            >
              Mark paid
            </ActionBtn>
          )}
          {row.status === "paid" && (
            <ActionBtn
              $variant="danger"
              onClick={() => refundInvoice(row.publicId)}
            >
              Refund
            </ActionBtn>
          )}
        </Space>
      ),
    },
  ];

  const { data } = useSession();
  const userName = data?.user?.name || "User";

  return (
    <DashboardLayout role="admin" userName={userName}>
      <PageHeader
        title="Invoices"
        subtitle="Create, send, and track all your invoices."
        action={
          <PrimaryBtn onClick={() => setShowModal(true)}>
            + New invoice
          </PrimaryBtn>
        }
      />

      {/* Summary bar */}
      <SummaryBar>
        <SummaryItem>
          <SummaryLabel>Total value</SummaryLabel>
          <SummaryValue>
            ₦{((overview?.totalRevenue || 0) / 1000).toFixed(0)}k
          </SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Collected</SummaryLabel>
          <SummaryValue style={{ color: theme.colors.success }}>
            ₦{((overview?.collected || 0) / 1000).toFixed(0)}k
          </SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Outstanding</SummaryLabel>
          <SummaryValue style={{ color: theme.colors.warning }}>
            ₦{((overview?.outstanding || 0) / 1000).toFixed(0)}k
          </SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Overdue</SummaryLabel>
          <SummaryValue style={{ color: theme.colors.danger }}>
            {overview?.overdueCount || 0}
          </SummaryValue>
        </SummaryItem>
      </SummaryBar>

      {/* Toolbar */}
      <Toolbar>
        <SearchInput
          placeholder="Search invoice or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={
            <SearchIcon
              style={{ color: theme.colors.textHint, width: 16, height: 16 }}
            />
          }
          allowClear
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v: any) => setStatusFilter(v)}
          style={{ width: 140 }}
          options={[
            { value: "all", label: "All statuses" },
            { value: "paid", label: "Paid" },
            { value: "pending", label: "Pending" },
            { value: "overdue", label: "Overdue" },
            { value: "refunded", label: "Refunded" },
          ]}
        />
        {selectedRowKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
              {selectedRowKeys.length} selected
            </span>
            <ActionBtn>Export CSV</ActionBtn>
            <ActionBtn $variant="danger">Delete</ActionBtn>
          </motion.div>
        )}
      </Toolbar>

      {/* Table */}
      <Card>
        <Table
          columns={columns as any}
          dataSource={invoices}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys as number[]),
          }}
          pagination={{
            current: meta.page,
            pageSize: meta.limit,
            total: meta.total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (total, range) => (
              <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                {range[0]}–{range[1]} of {total} invoices
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <EmptyState
                icon={<DocumentIcon />}
                text="No invoices found"
                sub="Try adjusting your filters"
              />
            ),
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>

      {/* New Invoice Modal */}
      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        title={
          <span style={{ fontWeight: 700, fontSize: 16 }}>New invoice</span>
        }
        width={460}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Formik
          initialValues={{
            customer: "",
            email: "",
            amount: "",
            description: "",
            dueDate: "",
          }}
          validationSchema={NewInvoiceSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              await createInvoice({
                customerId: values.customer,
                status: "pending",
                items: [
                  {
                    description: values.description,
                    quantity: 1,
                    unitPrice: Number(values.amount),
                  },
                ],
              });
              resetForm();
              setShowModal(false);
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <FormikForm>
              <ModalField>
                <ModalLabel>Customer name</ModalLabel>
                <Field
                  as={StyledInput}
                  name="customer"
                  placeholder="e.g. Acme Corp"
                  $hasError={!!(errors.customer && touched.customer)}
                />
                <ErrorMessage
                  name="customer"
                  render={(msg) => <FieldErr>{msg}</FieldErr>}
                />
              </ModalField>

              <ModalField>
                <ModalLabel>Customer email</ModalLabel>
                <Field
                  as={StyledInput}
                  name="email"
                  type="email"
                  placeholder="billing@company.com"
                  $hasError={!!(errors.email && touched.email)}
                />
                <ErrorMessage
                  name="email"
                  render={(msg) => <FieldErr>{msg}</FieldErr>}
                />
              </ModalField>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <ModalField>
                  <ModalLabel>Amount (₦)</ModalLabel>
                  <Field
                    as={StyledInput}
                    name="amount"
                    type="number"
                    placeholder="50000"
                    $hasError={!!(errors.amount && touched.amount)}
                  />
                  <ErrorMessage
                    name="amount"
                    render={(msg) => <FieldErr>{msg}</FieldErr>}
                  />
                </ModalField>
                <ModalField>
                  <ModalLabel>Due date</ModalLabel>
                  <Field
                    as={StyledInput}
                    name="dueDate"
                    type="date"
                    $hasError={!!(errors.dueDate && touched.dueDate)}
                  />
                  <ErrorMessage
                    name="dueDate"
                    render={(msg) => <FieldErr>{msg}</FieldErr>}
                  />
                </ModalField>
              </div>

              <ModalField>
                <ModalLabel>Description</ModalLabel>
                <Field
                  as="textarea"
                  name="description"
                  placeholder="Services rendered..."
                  style={{
                    width: "100%",
                    minHeight: 80,
                    border: `1.5px solid ${errors.description && touched.description ? theme.colors.danger : theme.colors.cardBorder}`,
                    borderRadius: 9,
                    padding: "10px 12px",
                    fontSize: 14,
                    fontFamily: theme.fonts.sans,
                    color: theme.colors.textPrimary,
                    background: theme.colors.pageBg,
                    resize: "vertical",
                    outline: "none",
                  }}
                />
                <ErrorMessage
                  name="description"
                  render={(msg) => <FieldErr>{msg}</FieldErr>}
                />
              </ModalField>

              <ModalFooter>
                <ActionBtn type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </ActionBtn>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    height: 38,
                    padding: "0 20px",
                    background: theme.colors.primary,
                    color: "#fff",
                    border: "none",
                    borderRadius: 9,
                    fontSize: 13.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: theme.fonts.sans,
                    boxShadow: theme.shadow.indigo,
                  }}
                >
                  {isSubmitting ? "Creating..." : "Create invoice"}
                </button>
              </ModalFooter>
            </FormikForm>
          )}
        </Formik>
      </Modal>
    </DashboardLayout>
  );
}
