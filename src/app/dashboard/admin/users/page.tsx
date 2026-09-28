/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, PageHeader } from "@/components/ui";
import { useUsers } from "@/hooks/queries/useUsers";
import { theme } from "@/styles/theme";
import { SearchOutlined } from "@ant-design/icons";
import { Badge, Button, Input, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSession } from "next-auth/react";
import { useState } from "react";
import styled from "styled-components";

const TableWrapper = styled.div`
  .ant-table {
    background: ${theme.colors.cardBg};
    border-radius: 8px;
    overflow: hidden;

    .ant-table-thead > tr > th {
      background: ${theme.colors.sidebarBg};
      color: ${theme.colors.textSecondary};
      border-color: ${theme.colors.divider};
      font-weight: 600;
    }

    .ant-table-tbody > tr {
      border-bottom-color: ${theme.colors.divider};

      &:hover > td {
        background: rgba(99, 102, 241, 0.05);
      }
    }

    td {
      color: ${theme.colors.textPrimary};
      border-bottom-color: ${theme.colors.divider};
    }
  }

  .ant-table-pagination {
    margin-top: 16px;

    .ant-pagination-item,
    .ant-pagination-item-active {
      background: ${theme.colors.sidebarBg};
      border-color: ${theme.colors.divider};
    }
  }
`;

const SearchBox = styled(Input)`
  margin-bottom: 16px;
  background: ${theme.colors.sidebarBg};
  border-color: ${theme.colors.divider};
  color: ${theme.colors.textPrimary};

  &::placeholder {
    color: ${theme.colors.textHint};
  }

  &:focus {
    background: ${theme.colors.sidebarBg};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.textPrimary};
  }
`;

const ActionSpace = styled(Space)`
  button {
    background: ${theme.colors.primary};
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 4px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: ${theme.colors.primaryHover || "#6366F1"};
    }
  }
`;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const { data: sessionData } = useSession();
  const userName = sessionData?.user?.name || "Admin";
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();

  const [searchText, setSearchText] = useState("");

  const users: User[] = usersData?.data || [];

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns: ColumnsType<User> = [
    {
      title: "User Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Badge
          color={role === "admin" ? theme.colors.primary : "#10B981"}
          text={role?.charAt(0).toUpperCase() + role?.slice(1)}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          color={status === "active" ? "#10B981" : "#F59E0B"}
          text={status?.charAt(0).toUpperCase() + status?.slice(1)}
        />
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <ActionSpace size="small">
          <Button type="primary" size="small">
            View
          </Button>
          <Button type="default" size="small">
            Edit
          </Button>
          <Button type="primary" danger size="small">
            Delete
          </Button>
        </ActionSpace>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader>
        <h1>Users Management</h1>
        <p>Welcome back, {userName}</p>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>

        <SearchBox
          placeholder="Search users by name or email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <TableWrapper>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={isLoadingUsers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
            }}
          />
        </TableWrapper>
      </Card>
    </DashboardLayout>
  );
}
