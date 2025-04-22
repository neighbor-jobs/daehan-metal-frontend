import {Product} from '../types/productRes.ts';

export const getUniqueScalesByProductName = (productList: Product[], productName: string): string[] => {
  const selectedProduct = productList.find((p) => p.productName === productName);
  const scaleOptions: string[] = selectedProduct?.info?.scales?.map((s) => s.scale) || [];
  return Array.from(new Set(scaleOptions));
};
