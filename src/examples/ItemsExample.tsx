"use client";

import { useItems } from "@/hooks/useItems";
import { useState } from "react";
import {
  Button,
  Input,
  Table,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
} from "antd";
import { Item } from "@/types/item";

export function ItemsExample() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();

  // useItems 훅 사용
  const { useGetItems, useAddItem, useUpdateItemQuantity, useDeleteItem } =
    useItems(selectedWarehouseId);

  // 아이템 쿼리 - 검색어와 창고ID 기반
  const { data: itemsData, isLoading, isError } = useGetItems(searchQuery);

  // 아이템 추가 뮤테이션
  const addItemMutation = useAddItem();

  // 아이템 수량 업데이트 뮤테이션
  const updateQuantityMutation = useUpdateItemQuantity();

  // 아이템 삭제 뮤테이션
  const deleteItemMutation = useDeleteItem();

  // 아이템 테이블 컬럼 정의
  const columns = [
    {
      title: "품목 코드",
      dataIndex: "itemCode",
      key: "itemCode",
    },
    {
      title: "품목명",
      dataIndex: "itemName",
      key: "itemName",
    },
    {
      title: "수량",
      dataIndex: "itemQuantity",
      key: "itemQuantity",
      render: (quantity: number, record: Item) => (
        <Space>
          <span>{quantity}</span>
          <Button
            size="small"
            onClick={() =>
              handleUpdateQuantity(record.id.toString(), quantity + 1)
            }
          >
            +
          </Button>
          <Button
            size="small"
            onClick={() =>
              handleUpdateQuantity(
                record.id.toString(),
                Math.max(0, quantity - 1)
              )
            }
            disabled={quantity <= 0}
          >
            -
          </Button>
        </Space>
      ),
    },
    {
      title: "액션",
      key: "action",
      render: (_: unknown, record: Item) => (
        <Button danger onClick={() => handleDeleteItem(record.id.toString())}>
          삭제
        </Button>
      ),
    },
  ];

  // 아이템 수량 업데이트 핸들러
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateQuantityMutation.mutate({
      id: itemId,
      data: { quantity: newQuantity },
      itemWarehouseId: selectedWarehouseId,
    });
  };

  // 아이템 삭제 핸들러
  const handleDeleteItem = (itemId: string) => {
    Modal.confirm({
      title: "아이템 삭제",
      content: "이 아이템을 삭제하시겠습니까?",
      onOk: () => {
        deleteItemMutation.mutate({
          id: itemId,
          itemWarehouseId: selectedWarehouseId,
        });
      },
    });
  };

  // 아이템 추가 모달 제출 핸들러
  const handleAddItem = (values: {
    name: string;
    description?: string;
    sku: string;
    quantity: number;
    minimumQuantity?: number;
    category?: string;
    unit?: string;
    price?: number;
  }) => {
    addItemMutation.mutate(
      {
        name: values.name,
        description: values.description || "",
        sku: values.sku,
        warehouseId: parseInt(selectedWarehouseId),
        quantity: values.quantity,
        minimumQuantity: values.minimumQuantity || 0,
        category: values.category || "",
        unit: values.unit || "개",
        price: values.price || 0,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
          form.resetFields();
        },
      }
    );
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>오류가 발생했습니다.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">재고 관리</h1>

      <div className="mb-4 flex gap-4">
        <Input
          placeholder="검색어 입력"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 300 }}
        />

        <Select
          placeholder="창고 선택"
          value={selectedWarehouseId || undefined}
          onChange={setSelectedWarehouseId}
          style={{ width: 200 }}
          allowClear
          options={[
            { value: "1", label: "창고 1" },
            { value: "2", label: "창고 2" },
            // 실제로는 API 호출을 통해 창고 목록을 불러와야 함
          ]}
        />

        <Button type="primary" onClick={() => setIsAddModalOpen(true)}>
          아이템 추가
        </Button>
      </div>

      <Table
        dataSource={itemsData?.data || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
      />

      {/* 아이템 추가 모달 */}
      <Modal
        title="아이템 추가"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddItem}>
          <Form.Item
            name="name"
            label="품목명"
            rules={[{ required: true, message: "품목명을 입력해주세요" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="sku"
            label="품목 코드"
            rules={[{ required: true, message: "품목 코드를 입력해주세요" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="수량"
            rules={[{ required: true, message: "수량을 입력해주세요" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="description" label="설명">
            <Input.TextArea />
          </Form.Item>

          <Form.Item className="text-right">
            <Space>
              <Button onClick={() => setIsAddModalOpen(false)}>취소</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={addItemMutation.isPending}
              >
                추가
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
