"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CheckIcon,
  EmptyState,
  InitialsAvatar,
  MonoAmount,
  PageHeader,
  SearchIcon,
  StatCard,
  StatusBadge,
  UserIcon,
  UsersIcon,
  WalletIcon,
  WarningIcon,
} from "@/components/ui";
import { useCreateCustomer } from "@/hooks/mutations/useCreateCustomer";
import { useCustomers } from "@/hooks/queries/useCustomers";
import { theme } from "@/styles/theme";
import {
  Descriptions,
  Divider,
  Drawer,
  Input,
  Progress,
  Space,
  Table,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";
import * as Yup from "yup";

const Toolbar = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  align-items: center;
  justify-content: space-between;
`;

const SearchContainer = styled(motion.div)`
  flex: 1;
  max-width: 320px;
`;

const SearchInput = styled(Input)`
  border-radius: 9px !important;
  height: 38px;
  font-family: ${theme.fonts.sans} !important;
  font-size: 13.5px !important;
  border-color: ${theme.colors.cardBorder} !important;
  transition: all 0.2s ease;
  &:focus-within {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
    border-color: ${theme.colors.primary} !important;
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
  transition: background 0.15s ease;
  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

const ActionBtn = styled.button`
  height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  font-size: 12px;
  border: 1px solid ${theme.colors.cardBorder};
  background: transparent;
  color: ${theme.colors.textSecondary};
  font-family: ${theme.fonts.sans};
  cursor: pointer;
  transition: all 0.15s;
  font-weight: 500;
  &:hover {
    background: ${theme.colors.divider};
    color: ${theme.colors.textPrimary};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

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
  height: 42px;
  border: 1.5px solid
    ${({ $hasError }) =>
      $hasError ? theme.colors.danger : theme.colors.cardBorder};
  border-radius: 9px;
  padding: 0 14px;
  font-size: 14px;
  font-family: ${theme.fonts.sans};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.pageBg};
  outline: none;
  transition: all 0.15s;
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: #fff;
  }
`;
const FieldErr = styled.span`
  font-size: 12px;
  color: ${theme.colors.danger};
  font-weight: 500;
  display: block;
  margin-top: 4px;
`;

interface Customer {
  key: number;
  publicId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  totalSpent: number;
  totalSpentFmt: string;
  invoiceCount: number;
  paidRate: number;
  status: "active" | "inactive" | "overdue";
  joinedFmt: string;
}

// ─── Data ─────────────────────────────────────────────────────────────

const AddCustomerSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  company: Yup.string().required("Company is required"),
  phone: Yup.string().optional(),
});

export default function AdminCustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: customersData } = useCustomers();
  const customers = Array.isArray(customersData) ? customersData : [];

  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [showViewDrawer, setShowViewDrawer] = useState(false);

  const { mutateAsync: createCustomer } = useCreateCustomer();

  const filtered = customers.filter(
    (c: any) =>
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);

  const columns: ColumnsType<Customer> = [
    {
      title: "Customer",
      render: (_, row: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <InitialsAvatar name={row.name} size="34px" />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{row.name}</div>
            <div style={{ fontSize: 12, color: theme.colors.textHint }}>
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Total spent",
      dataIndex: "totalSpentFmt",
      render: (v) => <MonoAmount $weight="600">{v}</MonoAmount>,
      sorter: (a: any, b: any) => a.totalSpent - b.totalSpent,
      width: 130,
    },
    {
      title: "Invoices",
      dataIndex: "invoiceCount",
      render: (n) => (
        <span
          style={{
            fontFamily: theme.fonts.mono,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {n}
        </span>
      ),
      width: 90,
      sorter: (a: any, b: any) => a.invoiceCount - b.invoiceCount,
    },
    {
      title: "Payment rate",
      dataIndex: "paidRate",
      width: 160,
      render: (rate) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Progress
            percent={rate}
            size="small"
            showInfo={false}
            strokeColor={
              rate === 100
                ? theme.colors.success
                : rate >= 70
                  ? theme.colors.warning
                  : theme.colors.danger
            }
            style={{ flex: 1, minWidth: 60 }}
          />
          <span
            style={{
              fontSize: 12,
              fontFamily: theme.fonts.mono,
              fontWeight: 500,
              width: 36,
              textAlign: "right",
            }}
          >
            {rate}%
          </span>
        </div>
      ),
      sorter: (a: any, b: any) => a.paidRate - b.paidRate,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => <StatusBadge status={s} />,
      width: 110,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
        { text: "Overdue", value: "overdue" },
      ],
      onFilter: (v, r: any) => r.status === v,
    },
    {
      title: "Joined",
      dataIndex: "joinedFmt",
      render: (d) => (
        <span style={{ fontSize: 13, color: theme.colors.textHint }}>{d}</span>
      ),
      width: 110,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, row: any) => (
        <Space size={6}>
          <ActionBtn
            onClick={() => {
              setSelectedCustomer(row);
              setShowViewDrawer(true);
            }}
          >
            View
          </ActionBtn>
          <ActionBtn
            onClick={() =>
              router.push(
                `/dashboard/admin/invoices?search=${encodeURIComponent(row.email)}`,
              )
            }
          >
            Invoices
          </ActionBtn>
        </Space>
      ),
    },
  ];

  const { data } = useSession();
  const userName = data?.user?.name || "User";
  return (
    <DashboardLayout role="admin" userName={userName}>
      <PageHeader
        title="Customers"
        subtitle="Manage all registered customers and their billing history."
        action={
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <PrimaryBtn onClick={() => setShowAddDrawer(true)}>
              + Add customer
            </PrimaryBtn>
          </motion.div>
        }
      />

      <Grid>
        <StatCard
          label="Total customers"
          value={String(customers.length)}
          delta=""
          deltaType="positive"
          icon={<UsersIcon />}
          iconColor="#EFF6FF"
          delay={0}
        />
        <StatCard
          label="Total revenue"
          value={`₦${(totalSpent / 1000).toFixed(1)}k`}
          delta=""
          deltaType="neutral"
          icon={<WalletIcon />}
          iconColor={theme.colors.primaryLight}
          delay={0.05}
        />
        <StatCard
          label="Active"
          value={String(
            customers.filter((c: any) => c.status === "active").length,
          )}
          delta=""
          deltaType="positive"
          icon={<CheckIcon />}
          iconColor={theme.colors.successLight}
          delay={0.1}
        />
        <StatCard
          label="Overdue accts"
          value={String(
            customers.filter((c: any) => c.status === "overdue").length,
          )}
          delta=""
          deltaType="negative"
          icon={<WarningIcon />}
          iconColor={theme.colors.dangerLight}
          delay={0.15}
        />
      </Grid>

      <Toolbar>
        <SearchContainer
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SearchInput
            placeholder="Search by name, email or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            prefix={
              <SearchIcon
                style={{ color: theme.colors.textHint, width: 16, height: 16 }}
              />
            }
          />
        </SearchContainer>
      </Toolbar>

      <Card>
        <Table
          columns={columns}
          dataSource={filtered}
          pagination={{
            pageSize: 8,
            showTotal: (t, r) => (
              <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                {r[0]}–{r[1]} of {t}
              </span>
            ),
          }}
          locale={{
            emptyText: (
              <EmptyState
                icon={<UserIcon />}
                text="No customers found"
                sub="Try a different search"
              />
            ),
          }}
          scroll={{ x: 900 }}
          size="middle"
        />
      </Card>

      {/* Add Customer Drawer */}
      <Drawer
        title={
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              fontFamily: theme.fonts.sans,
            }}
          >
            Add New Customer
          </span>
        }
        width={450}
        onClose={() => setShowAddDrawer(false)}
        open={showAddDrawer}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Formik
          initialValues={{ name: "", email: "", company: "", phone: "" }}
          validationSchema={AddCustomerSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              await createCustomer({
                name: values.name,
                email: values.email,
                phone: values.phone || "",
                address: values.company || "",
              });
              resetForm();
              setShowAddDrawer(false);
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <div
                  style={{
                    marginBottom: 24,
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    lineHeight: 1.5,
                  }}
                >
                  Enter the details of the new customer below. They will be
                  added to your directory immediately.
                </div>

                {[
                  {
                    name: "name",
                    label: "Full name",
                    placeholder: "Amara Osei",
                    type: "text",
                  },
                  {
                    name: "email",
                    label: "Email",
                    placeholder: "amara@company.com",
                    type: "email",
                  },
                  {
                    name: "company",
                    label: "Company",
                    placeholder: "Stellar Corp",
                    type: "text",
                  },
                  {
                    name: "phone",
                    label: "Phone (opt.)",
                    placeholder: "+234 800 000 0000",
                    type: "tel",
                  },
                ].map((f, i) => (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ModalField>
                      <ModalLabel>{f.label}</ModalLabel>
                      <Field
                        as={StyledInput}
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        $hasError={
                          !!(
                            errors[f.name as keyof typeof errors] &&
                            touched[f.name as keyof typeof touched]
                          )
                        }
                      />
                      <ErrorMessage
                        name={f.name}
                        render={(msg) => <FieldErr>{msg}</FieldErr>}
                      />
                    </ModalField>
                  </motion.div>
                ))}

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 24px",
                    background: "#fff",
                    borderTop: `1px solid ${theme.colors.divider}`,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                  }}
                >
                  <ActionBtn
                    type="button"
                    onClick={() => setShowAddDrawer(false)}
                    style={{ height: 40, padding: "0 20px" }}
                  >
                    Cancel
                  </ActionBtn>
                  <PrimaryBtn
                    type="submit"
                    disabled={isSubmitting}
                    style={{ height: 40, padding: "0 24px" }}
                  >
                    {isSubmitting ? "Adding..." : "Save Customer"}
                  </PrimaryBtn>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Drawer>

      {/* View Customer Details Drawer */}
      <Drawer
        title={
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              fontFamily: theme.fonts.sans,
            }}
          >
            Customer Details
          </span>
        }
        width={480}
        onClose={() => setShowViewDrawer(false)}
        open={showViewDrawer}
      >
        <AnimatePresence>
          {selectedCustomer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 32,
                }}
              >
                <InitialsAvatar name={selectedCustomer.name} size="64px" />
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 700,
                      color: theme.colors.textPrimary,
                    }}
                  >
                    {selectedCustomer.name}
                  </h2>
                  <div
                    style={{ color: theme.colors.textSecondary, fontSize: 14 }}
                  >
                    {selectedCustomer.email}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <StatusBadge status={selectedCustomer.status} />
                  </div>
                </div>
              </div>

              <Descriptions
                column={1}
                bordered
                size="middle"
                labelStyle={{
                  width: "140px",
                  background: theme.colors.pageBg,
                  fontWeight: 600,
                  color: theme.colors.textSecondary,
                }}
              >
                {selectedCustomer.address && (
                  <Descriptions.Item label="Company / Address">
                    {selectedCustomer.address}
                  </Descriptions.Item>
                )}
                {selectedCustomer.phone && (
                  <Descriptions.Item label="Phone">
                    {selectedCustomer.phone}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Joined">
                  {selectedCustomer.joinedFmt}
                </Descriptions.Item>
                <Descriptions.Item label="Total Spent">
                  <MonoAmount $weight="600" $size="15px">
                    {selectedCustomer.totalSpentFmt || "₦0"}
                  </MonoAmount>
                </Descriptions.Item>
                <Descriptions.Item label="Invoices">
                  <Tag
                    color="blue"
                    style={{
                      borderRadius: 12,
                      padding: "0 10px",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {selectedCustomer.invoiceCount ?? 0} Total
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Rate">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Progress
                      percent={selectedCustomer.paidRate || 0}
                      size="small"
                      showInfo={false}
                      strokeColor={
                        selectedCustomer.paidRate === 100
                          ? theme.colors.success
                          : selectedCustomer.paidRate >= 70
                            ? theme.colors.warning
                            : theme.colors.danger
                      }
                      style={{ width: 120, margin: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: theme.fonts.mono,
                        fontWeight: 600,
                      }}
                    >
                      {selectedCustomer.paidRate ?? 0}%
                    </span>
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: "32px 0 24px" }} />

              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}
              >
                <ActionBtn
                  onClick={() => setShowViewDrawer(false)}
                  style={{ height: 38, padding: "0 20px" }}
                >
                  Close
                </ActionBtn>
                <PrimaryBtn
                  onClick={() => {
                    setShowViewDrawer(false);
                    router.push(
                      `/dashboard/admin/invoices?search=${encodeURIComponent(selectedCustomer.email)}`,
                    );
                  }}
                >
                  View All Invoices
                </PrimaryBtn>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </DashboardLayout>
  );
}
