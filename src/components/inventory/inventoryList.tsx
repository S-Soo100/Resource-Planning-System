"use client";
import React, { useEffect } from "react";
import { useProductStore } from "./productStore";

const InventoryList: React.FC = () => {
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div>
      {isLoading ? (
        <p>상품 데이터를 불러오는 중입니다...</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InventoryList;
