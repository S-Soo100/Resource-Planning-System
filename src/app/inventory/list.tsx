// import { useQuery } from "@tanstack/react-query";
import { useInventoryList } from "../../hooks/useInventory";

export default function InventoryList() {
  const { isLoading, error, data: inventories } = useInventoryList();

  // 재고 목록 렌더링 로직
  return (
    <div>
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "An error has occurred"
      ) : (
        <ul>
          {inventories.map((inventory) => (
            <li key={inventory.id}>{inventory.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
