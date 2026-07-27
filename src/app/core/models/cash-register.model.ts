export interface DailySalesDto {
  date: string;
  totalSales: number;
  paidOrdersCount: number;
  cashSales: number;
  cardSales: number;
  averageTicket: number;
}
