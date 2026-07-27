export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number;
  quantity: number;
  isAvailable: boolean;
}
