import { Supplier } from "@/types/(order)/supplier";

export const useSuppliers = () => {
  const suppliers: Supplier[] = [
    {
      id: 876,
      name: "테스트 공급자1",
      contactPerson: "김테스트",
      email: "testKim@naver.com",
      phone: "04012345676",
      address: "경기도 테스트시 테스트구 테스트동 433-3",
      description: "테스트 공급자 입니다.",
      createdAt: "2025-04-13T00:00:00.000Z",
      updatedAt: "2025-04-13T00:00:00.000Z",
    },
  ];
  const isLoading = false;
  const isError = false;

  return {
    suppliers,
    isLoading,
    isError,
  };
};
