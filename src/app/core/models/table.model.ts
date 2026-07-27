export interface Table {
  id: number;
  number: string;
  capacity: number;
  status: string;
  isOccupied: boolean;
}

export interface CreateTableRequest {
  number: string;
  capacity: number;
  isOccupied: boolean;
}
