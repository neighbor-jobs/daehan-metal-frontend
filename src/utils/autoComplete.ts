import {Product} from '../types/productRes.ts';

export const getUniqueScalesByProductName = (productList: Product[], productName: string): string[] => {
  const selectedProduct = productList.find((p) => p.name === productName);
  const scaleOptions: string[] = selectedProduct?.scales?.map((s) => s) || [];
  return Array.from(new Set(scaleOptions));
};
