"use client";
import React, { Suspense, useEffect, useState } from "react";
// import { authStore } from "@/store/authStore";
// import { useRouter } from "next/navigation";
// import { FaUsers, FaWarehouse, FaBuilding } from "react-icons/fa";
// import TeamMembersManagement from "@/components/admin/TeamMembersManagement";
import WarehouseManagement from "@/components/admin/WarehouseManagement";
// import TeamManagement from "@/components/admin/TeamManagement";
// import AdminMenuCard from "@/components/admin/AdminMenuCard";
import { useCurrentTeam } from "@/hooks/useCurrentTeam";
import { TeamWarehouse } from "@/types/warehouse";

// import React, { useState } from "react";
// import { useTeamItems } from "@/hooks/useTeamItems";
// import { CreateTeamItemDto } from "@/types/team-item";
// import { authStore } from "@/store/authStore";
export default function TeamItemsPage() {
  const [localWarehouses, setLocalWarehouses] = useState<TeamWarehouse[]>([]);
  const { team } = useCurrentTeam();

  useEffect(() => {
    if (team) {
      setLocalWarehouses(team.warehouses);
      console.log("team.warehouses:", JSON.stringify(team.warehouses, null, 2));
    }
  }, [team]);

  return (
    <Suspense>
      <WarehouseManagement
        warehouses={
          localWarehouses
            ? localWarehouses.map((warehouse) => ({
                id: warehouse.id.toString(),
                warehouseName: warehouse.warehouseName,
                warehouseAddress: warehouse.warehouseAddress,
              }))
            : []
        }
      />
    </Suspense>
  );
}

// export default function TeamItemsPage() {
//   const { useGetTeamItems, useCreateTeamItem } = useTeamItems();
//   const { data: teamItems = [], isLoading, error } = useGetTeamItems();
//   const { createTeamItem, isPending: submitLoading } = useCreateTeamItem();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [formData, setFormData] = useState<Omit<CreateTeamItemDto, "teamId">>({
//     itemCode: "",
//     itemName: "",
//     memo: "",
//   });
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const selectedTeam = authStore((state) => state.selectedTeam);

//   const handleOpenModal = () => {
//     setIsModalOpen(true);
//     setSubmitError(null);
//     setFormData({
//       itemCode: "",
//       itemName: "",
//       memo: "",
//     });
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!selectedTeam?.id) {
//       setSubmitError("선택된 팀이 없습니다.");
//       return;
//     }

//     if (!formData.itemCode || !formData.itemName) {
//       setSubmitError("품목 코드와 품목명은 필수 입력값입니다.");
//       return;
//     }

//     setSubmitError(null);

//     try {
//       const teamIdNumber = parseInt(selectedTeam.id, 10);
//       const teamItemDto: CreateTeamItemDto = {
//         ...formData,
//         teamId: teamIdNumber,
//       };

//       await createTeamItem(teamItemDto);
//       handleCloseModal();
//     } catch (error) {
//       console.error("아이템 생성 오류:", error);
//       setSubmitError("아이템 생성 중 오류가 발생했습니다.");
//     }
//   };

//   if (isLoading) {
//     return <div className="p-4 text-center">로딩 중...</div>;
//   }

//   if (error) {
//     return (
//       <div className="p-4 text-center text-red-500">
//         {error.message || "오류가 발생했습니다"}
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">팀 아이템 관리</h1>
//         <button
//           onClick={handleOpenModal}
//           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
//         >
//           <span className="mr-1 text-xl">+</span> 아이템 추가
//         </button>
//       </div>

//       {teamItems.length > 0 ? (
//         <div className="bg-white shadow-md rounded-lg overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   아이템 코드
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   아이템명
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   팀 ID
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   메모
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
//                   관리
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {teamItems.map((item) => (
//                 <tr key={item.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.itemCode || "-"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.itemName}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{item.teamId}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.memo || "-"}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm w-24 text-center">
//                     <button
//                       className="text-blue-500 hover:text-blue-700 mr-2 opacity-50 cursor-not-allowed"
//                       disabled
//                     >
//                       수정
//                     </button>
//                     <button
//                       className="text-red-500 hover:text-red-700 opacity-50 cursor-not-allowed"
//                       disabled
//                     >
//                       삭제
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="text-center p-8 bg-gray-50 rounded-lg">
//           <p className="text-gray-500 mb-4">등록된 팀 아이템이 없습니다.</p>
//           <button
//             onClick={handleOpenModal}
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
//           >
//             아이템 추가하기
//           </button>
//         </div>
//       )}

//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-md">
//             <h2 className="text-xl font-bold mb-4">새 팀 아이템 추가</h2>
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="itemCode"
//                 >
//                   품목 코드 <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="itemCode"
//                   name="itemCode"
//                   type="text"
//                   value={formData.itemCode}
//                   onChange={handleInputChange}
//                   placeholder="예: ITEM001"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   required
//                 />
//               </div>

//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="itemName"
//                 >
//                   품목명 <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   id="itemName"
//                   name="itemName"
//                   type="text"
//                   value={formData.itemName}
//                   onChange={handleInputChange}
//                   placeholder="예: 노트북"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   required
//                 />
//               </div>

//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="memo"
//                 >
//                   메모
//                 </label>
//                 <textarea
//                   id="memo"
//                   name="memo"
//                   value={formData.memo || ""}
//                   onChange={handleInputChange}
//                   placeholder="예: 신형 모델"
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
//                 />
//               </div>

//               {submitError && (
//                 <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
//                   {submitError}
//                 </div>
//               )}

//               <div className="mt-4 flex justify-end">
//                 <button
//                   type="button"
//                   className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2"
//                   onClick={handleCloseModal}
//                   disabled={submitLoading}
//                 >
//                   취소
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
//                   disabled={submitLoading}
//                 >
//                   {submitLoading ? "저장 중..." : "저장"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
