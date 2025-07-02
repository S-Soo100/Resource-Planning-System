export interface OrderComment {
  id: number;
  orderId: number;
  userId: number;
  userName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderCommentDto {
  content: string;
}

export interface UpdateOrderCommentDto {
  content: string;
}
