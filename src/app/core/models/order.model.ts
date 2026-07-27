export interface OrderDetail {
  id: number;
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  tableId: number;
  orderDate: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  orderDetails: OrderDetail[];
}

export interface CreateOrderItemRequest {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  tableId: number;
  status: string;
  paymentMethod: string;
  items: CreateOrderItemRequest[];
}
