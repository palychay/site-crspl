export interface Sneaker {
  id: number;
  name: string;
  brand: string;
  model: string;
  size: number;
  color: string;
  price: number;
  stockQuantity: number;
  releaseDate: Date;
  isLimitedEdition: boolean;
}