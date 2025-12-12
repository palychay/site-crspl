export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: Date;
  shippingAddress: string;
  status: OrderStatus;
  totalAmount: number;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  sneakerId: number;
  sneakerName: string;
  quantity: number;
  unitPrice: number;
  size: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}