// import create from "zustand";

// interface Product {
//   name: string;
// }

// interface ProductState {
//   products: Product[];
//   isLoading: boolean;
//   error: string | null;
//   fetchProducts: () => Promise<void>;
// }

// export const useProductStore = create<ProductState>((set) => ({
//   products: [],
//   isLoading: false,
//   error: null,
//   fetchProducts: async () => {
//     set({ isLoading: true });
//     try {
//       const response = await fetch("/api/products");
//       const data = await response.json();
//       set({ products: data, isLoading: false });
//     } catch (error) {
//       set({
//         error: "상품 데이터를 가져오는 중 오류가 발생했습니다.",
//         isLoading: false,
//       });
//     }
//   },
// }));
