export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateMenuItemRequest {
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}
