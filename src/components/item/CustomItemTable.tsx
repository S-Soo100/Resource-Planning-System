"use client";

import { Item, CreateItemRequest } from "@/types/item";
import { Table, Input, Button, Space, Modal, Form, Select, Empty } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useAllInventories } from "@/hooks/useAllInventories";
import type { InputRef } from "antd";
import type { ColumnType, FilterConfirmProps } from "antd/es/table/interface";
import { authService } from "@/services/authService";
import { IWarehouse } from "@/types/warehouse";
import { useInventory } from "@/hooks/useInventory";
import { itemService, withInventoryUpdate } from "@/services/itemService";

type DataIndex = keyof Item;

export default function CustomItemTable() {
  const router = useRouter();
  const { items, isLoading, isError, invalidateInventory } = useInventory();
  // const [items, setItems] = useState(dummyItemResponse); // 더미 데이터 사용
  // const isLoading = false;
  // const isError = false;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);

  // 팀의 창고 정보 가져오기
  useEffect(() => {
    const team = authService.getSelectedTeam();
    if (team && team.Warehouses) {
      setWarehouses(team.Warehouses);
    } else {
      // 더미 창고 데이터 (테스트용)
      setWarehouses([]);
    }
  }, []);

  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void
  ) => {
    confirm();
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  // 새 아이템 추가를 위한 인터페이스 정의
  interface AddItemFormValues {
    itemCode: string;
    itemName: string;
    itemQuantity: number;
    warehouseId: number;
  }

  const handleAddItem = async (values: AddItemFormValues) => {
    // API를 통한 아이템 추가 로직
    const newItemData: CreateItemRequest = {
      name: values.itemName,
      description: "",
      sku: values.itemCode,
      warehouseId: values.warehouseId,
      quantity: values.itemQuantity || 0,
      minimumQuantity: 0,
      category: "",
      unit: "개",
      price: 0,
    };

    try {
      // withInventoryUpdate를 사용하여 아이템 추가 및 캐시 무효화
      const response = await withInventoryUpdate(
        () => itemService.addItem(newItemData),
        invalidateInventory,
        newItemData.warehouseId.toString()
      );

      if (response.success) {
        // 아이템 추가 성공 메시지
        alert(`아이템 "${values.itemName}"이(가) 추가되었습니다.`);
        handleCloseModal();
      } else {
        alert(
          `오류 발생: ${response.message || "알 수 없는 오류가 발생했습니다."}`
        );
      }
    } catch (error) {
      console.error("아이템 추가 중 오류 발생:", error);
      alert("아이템 추가 중 오류가 발생했습니다.");
    }
  };

  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<Item> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            검색
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            초기화
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            닫기
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      if (!record[dataIndex]) {
        return false;
      }
      return record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
    filterDropdownProps: {
      onOpenChange: (visible) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const columns: ColumnsType<Item> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      width: "5%",
    },
    {
      title: "품목 코드",
      dataIndex: "itemCode",
      key: "itemCode",
      ...getColumnSearchProps("itemCode"),
      width: "10%",
      render: (text, record) => (
        <a
          className="text-blue-500 hover:font-bold"
          onClick={() => {
            router.push(`/item/detail/${record.id}`);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "품목명",
      dataIndex: "itemName",
      key: "itemName",
      ...getColumnSearchProps("itemName"),
      width: "20%",
      render: (text, record) => (
        <a
          className="text-blue-500 hover:font-bold"
          onClick={() => {
            router.push(`/item/detail/${record.id}`);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "재고수량",
      dataIndex: "itemQuantity",
      key: "itemQuantity",
      sorter: (a, b) => a.itemQuantity - b.itemQuantity,
      width: "10%",
      render: (quantity) => quantity,
    },
    {
      title: "창고",
      dataIndex: "warehouseId",
      key: "warehouseId",
      width: "8%",
      render: (warehouseId) => {
        const warehouse = warehouses.find((w) => w.id === warehouseId);
        return warehouse ? warehouse.warehouseName : warehouseId;
      },
    },
    {
      title: "등록일",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      render: (date) => new Date(date).toLocaleDateString("ko-KR"),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "최종수정일",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: "12%",
      render: (date) => new Date(date).toLocaleDateString("ko-KR"),
      sorter: (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: "관리",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            onClick={() => router.push(`/item/edit/${record.id}`)}
          >
            수정
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => router.push(`/item/log/${record.itemCode}`)}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            입출고 기록
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoading)
    return <div className="p-4 text-center">데이터를 불러오는 중...</div>;
  if (isError)
    return (
      <div className="p-4 text-center text-red-500">
        데이터를 불러오는 중 오류가 발생했습니다.
      </div>
    );

  return (
    <div className="overflow-x-auto relative">
      <Table
        columns={columns}
        dataSource={items}
        rowKey={(record) =>
          record?.id ? `item-${record.id}` : Math.random().toString()
        }
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: 1100 }}
        className="shadow-lg"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="py-6">
                  <p className="text-lg text-gray-500 mb-4">
                    표시할 품목이 없습니다
                  </p>
                  <Button type="primary" onClick={handleOpenModal}>
                    새 품목 추가하기
                  </Button>
                </div>
              }
            />
          ),
        }}
      />

      {/* Floating Button for Adding Item */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center transition-all duration-300"
        title="새 품목 추가"
      >
        <PlusOutlined style={{ fontSize: "24px" }} />
      </button>

      {/* Modal for Adding New Item */}
      <Modal
        title="새 품목 추가"
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddItem}
          className="mt-4"
        >
          <Form.Item
            name="itemCode"
            label="품목 코드"
            rules={[{ required: true, message: "품목 코드를 입력해주세요" }]}
          >
            <Input placeholder="예: ABC-123" />
          </Form.Item>

          <Form.Item
            name="itemName"
            label="품목명"
            rules={[{ required: true, message: "품목명을 입력해주세요" }]}
          >
            <Input placeholder="예: 서플라이 휠" />
          </Form.Item>

          <Form.Item name="itemQuantity" label="초기 수량" initialValue={0}>
            <Input type="number" min={0} />
          </Form.Item>

          <Form.Item
            name="warehouseId"
            label="창고"
            rules={[{ required: true, message: "창고를 선택해주세요" }]}
          >
            <Select placeholder="창고를 선택하세요">
              {warehouses.map((warehouse) => (
                <Select.Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.warehouseName} ({warehouse.warehouseAddress})
                </Select.Option>
              ))}
              {warehouses.length === 0 && (
                <Select.Option disabled value="no-warehouses">
                  사용 가능한 창고가 없습니다
                </Select.Option>
              )}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleCloseModal}>취소</Button>
            <Button type="primary" htmlType="submit">
              추가
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
// function useAllInventories(): { items: any; isLoading: any; isError: any } {
//   throw new Error("Function not implemented.");
// }
