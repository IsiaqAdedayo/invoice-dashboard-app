/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { MonoAmount, PageHeader, StatusBadge } from "@/components/ui";
import { useMyInvoices } from "@/hooks/queries/useMyInvoices";
import { downloadInvoicePdf } from "@/services/invoice.service";
import { theme } from "@/styles/theme";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Button, Spin, message } from "antd";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import styled from "styled-components";

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  background: ${theme.colors.sidebarBg};
  border-color: ${theme.colors.divider};
  color: ${theme.colors.textPrimary};

  &:hover {
    background: ${theme.colors.cardBg};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primary};
  }
`;

const InvoiceContainer = styled(motion.div)`
  background: ${theme.colors.cardBg};
  border: 1px solid ${theme.colors.cardBorder};
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: ${theme.shadow.lg};

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 2px solid ${theme.colors.divider};
`;

const CompanyInfo = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 700;
    color: ${theme.colors.textPrimary};
    margin: 0 0 8px;
  }

  p {
    color: ${theme.colors.textSecondary};
    font-size: 14px;
    margin: 4px 0;
  }
`;

const InvoiceDetails = styled.div`
  display: flex;
  gap: 40px;
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const DetailColumn = styled.div`
  text-align: right;

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const DetailLabel = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  font-weight: 600;
`;

const DetailValue = styled.div`
  color: ${theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 600;
  font-family: ${theme.fonts.mono};
`;

const ItemsTable = styled.div`
  margin-bottom: 32px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 2px solid ${theme.colors.divider};
  margin-bottom: 16px;
  font-weight: 600;
  color: ${theme.colors.textSecondary};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${theme.colors.divider};
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SummarySection = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 40px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 2px solid ${theme.colors.divider};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 8px 0;
`;

const SummaryLabel = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: 14px;
`;

const SummaryValue = styled.div`
  color: ${theme.colors.textPrimary};
  font-weight: 600;
  font-family: ${theme.fonts.mono};
  text-align: right;
  min-width: 120px;
`;

const TotalRow = styled(SummaryRow)`
  font-size: 18px;
  font-weight: 700;
  padding: 16px 0;
  border-top: 2px solid ${theme.colors.divider};
  border-bottom: 2px solid ${theme.colors.divider};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid ${theme.colors.divider};

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;

  &.primary {
    background: ${theme.colors.primary};
    color: white;
    border: none;

    &:hover {
      background: ${theme.colors.primaryHover};
    }
  }

  &.secondary {
    background: ${theme.colors.sidebarBg};
    border-color: ${theme.colors.divider};
    color: ${theme.colors.textPrimary};

    &:hover {
      background: ${theme.colors.cardBg};
      border-color: ${theme.colors.primary};
      color: ${theme.colors.primary};
    }
  }
`;

export default function CustomerInvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const invoiceId = params.id as string;
  const customerId = (session?.user as any)?.customerId;

  const { data: invoicesData, isLoading } = useMyInvoices(customerId);
  const invoice = invoicesData?.data?.find(
    (inv: any) => inv.publicId === invoiceId || inv.id === invoiceId,
  );

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadInvoicePdf(invoice?.publicId || invoiceId);
      message.success("Invoice downloaded successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to download invoice");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <PageHeader>
          <h1>Invoice Not Found</h1>
        </PageHeader>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="customer"
      userName={session?.user?.name || "Customer"}
    >
      <PageHeader>
        <h1>Invoice Details</h1>
        <p>Invoice ID: {invoiceId}</p>
      </PageHeader>

      <BackButton icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
        Back
      </BackButton>

      <InvoiceContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <InvoiceHeader>
          <CompanyInfo>
            <h1>INVOICE</h1>
            <p>Professional Invoice Management System</p>
          </CompanyInfo>

          <InvoiceDetails>
            <DetailColumn>
              <DetailLabel>Invoice Number</DetailLabel>
              <DetailValue>{invoice.invoiceNumber}</DetailValue>
            </DetailColumn>
            <DetailColumn>
              <DetailLabel>Status</DetailLabel>
              <div style={{ marginTop: 4 }}>
                <StatusBadge status={invoice.status} />
              </div>
            </DetailColumn>
            <DetailColumn>
              <DetailLabel>Date</DetailLabel>
              <DetailValue>
                {new Date(invoice.createdAt).toLocaleDateString()}
              </DetailValue>
            </DetailColumn>
          </InvoiceDetails>
        </InvoiceHeader>

        <div style={{ marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <DetailLabel style={{ marginBottom: 8 }}>FROM</DetailLabel>
            <p style={{ color: theme.colors.textPrimary, fontSize: 14 }}>
              Your Company Name
            </p>
          </div>

          <div>
            <DetailLabel style={{ marginBottom: 8 }}>TO</DetailLabel>
            <p
              style={{
                color: theme.colors.textPrimary,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {invoice.customerName || "You"}
            </p>
            <p style={{ color: theme.colors.textSecondary, fontSize: 13 }}>
              {invoice.customerEmail}
            </p>
          </div>
        </div>

        <ItemsTable>
          <TableHeader>
            <div>Description</div>
            <div>Quantity</div>
            <div>Unit Price</div>
            <div style={{ textAlign: "right" }}>Total</div>
          </TableHeader>

          {invoice.items?.map((item: any, index: number) => (
            <TableRow key={index}>
              <div style={{ color: theme.colors.textPrimary, fontSize: 14 }}>
                {item.description}
              </div>
              <div style={{ color: theme.colors.textPrimary, fontSize: 14 }}>
                {item.quantity}
              </div>
              <div style={{ color: theme.colors.textPrimary, fontSize: 14 }}>
                <MonoAmount amount={item.unitPrice} />
              </div>
              <div
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: 14,
                  textAlign: "right",
                }}
              >
                <MonoAmount amount={item.total} />
              </div>
            </TableRow>
          ))}
        </ItemsTable>

        <SummarySection>
          <div style={{ minWidth: 200 }}>
            {invoice.discountPercentage && (
              <SummaryRow>
                <SummaryLabel>
                  Discount ({invoice.discountPercentage}%)
                </SummaryLabel>
                <SummaryValue>
                  -₦
                  {(
                    (invoice.subtotal * invoice.discountPercentage) /
                    100
                  ).toFixed(2)}
                </SummaryValue>
              </SummaryRow>
            )}
            <SummaryRow>
              <SummaryLabel>Tax ({invoice.taxPercentage || 0}%)</SummaryLabel>
              <SummaryValue>₦{(invoice.tax || 0).toFixed(2)}</SummaryValue>
            </SummaryRow>
            <TotalRow>
              <SummaryLabel>Total Amount Due</SummaryLabel>
              <SummaryValue style={{ fontSize: 20 }}>
                <MonoAmount amount={invoice.total} />
              </SummaryValue>
            </TotalRow>
          </div>
        </SummarySection>

        <ActionButtons>
          <ActionButton
            className="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </ActionButton>
          <ActionButton
            className="secondary"
            icon={<PrinterOutlined />}
            onClick={handlePrint}
          >
            Print
          </ActionButton>
        </ActionButtons>
      </InvoiceContainer>
    </DashboardLayout>
  );
}
