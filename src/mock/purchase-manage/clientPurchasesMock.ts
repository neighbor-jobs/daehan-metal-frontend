import {ClientPurchasesColumn} from '../../types/tableColumns.ts';

const clientPurchasesMock = [
  {
    [ClientPurchasesColumn.DATE]: '2025-03-13',
    [ClientPurchasesColumn.PRODUCT_NAME]: '반도체 웨이퍼',
    [ClientPurchasesColumn.SCALE]: '300mm',
    [ClientPurchasesColumn.COUNT]: '100',
    [ClientPurchasesColumn.MATERIAL_UNIT_PRICE]: '5000',
    [ClientPurchasesColumn.MATERIAL_PRICE]: '500000',
    [ClientPurchasesColumn.PROCESSING_UNIT_PRICE]: '2000',
    [ClientPurchasesColumn.PROCESSING_PRICE]: '200000',
    [ClientPurchasesColumn.TOTAL_AMOUNT]: '700000',
    [ClientPurchasesColumn.PAYING_AMOUNT]: '500000',
    [ClientPurchasesColumn.REMAINING_AMOUNT]: '200000'
  },
  {
    [ClientPurchasesColumn.DATE]: '2025-03-13',
    [ClientPurchasesColumn.PRODUCT_NAME]: '배터리 셀',
    [ClientPurchasesColumn.SCALE]: '21700',
    [ClientPurchasesColumn.COUNT]: '50',
    [ClientPurchasesColumn.MATERIAL_UNIT_PRICE]: '12000',
    [ClientPurchasesColumn.MATERIAL_PRICE]: '600000',
    [ClientPurchasesColumn.PROCESSING_UNIT_PRICE]: '3000',
    [ClientPurchasesColumn.PROCESSING_PRICE]: '150000',
    [ClientPurchasesColumn.TOTAL_AMOUNT]: '750000',
    [ClientPurchasesColumn.PAYING_AMOUNT]: '600000',
    [ClientPurchasesColumn.REMAINING_AMOUNT]: '150000'
  },
  {
    [ClientPurchasesColumn.DATE]: '2025-03-12',
    [ClientPurchasesColumn.PRODUCT_NAME]: 'D램 모듈',
    [ClientPurchasesColumn.SCALE]: '16GB',
    [ClientPurchasesColumn.COUNT]: '200',
    [ClientPurchasesColumn.MATERIAL_UNIT_PRICE]: '25000',
    [ClientPurchasesColumn.MATERIAL_PRICE]: '5000000',
    [ClientPurchasesColumn.PROCESSING_UNIT_PRICE]: '5000',
    [ClientPurchasesColumn.PROCESSING_PRICE]: '1000000',
    [ClientPurchasesColumn.TOTAL_AMOUNT]: '6000000',
    [ClientPurchasesColumn.PAYING_AMOUNT]: '4000000',
    [ClientPurchasesColumn.REMAINING_AMOUNT]: '2000000'
  },
  {
    [ClientPurchasesColumn.DATE]: '2025-03-11',
    [ClientPurchasesColumn.PRODUCT_NAME]: '전기차 배터리팩',
    [ClientPurchasesColumn.SCALE]: '80kWh',
    [ClientPurchasesColumn.COUNT]: '10',
    [ClientPurchasesColumn.MATERIAL_UNIT_PRICE]: '300000',
    [ClientPurchasesColumn.MATERIAL_PRICE]: '3000000',
    [ClientPurchasesColumn.PROCESSING_UNIT_PRICE]: '50000',
    [ClientPurchasesColumn.PROCESSING_PRICE]: '500000',
    [ClientPurchasesColumn.TOTAL_AMOUNT]: '3500000',
    [ClientPurchasesColumn.PAYING_AMOUNT]: '3000000',
    [ClientPurchasesColumn.REMAINING_AMOUNT]: '500000'
  },
  {
    [ClientPurchasesColumn.DATE]: '2025-03-10',
    [ClientPurchasesColumn.PRODUCT_NAME]: '서버용 SSD',
    [ClientPurchasesColumn.SCALE]: '2TB',
    [ClientPurchasesColumn.COUNT]: '30',
    [ClientPurchasesColumn.MATERIAL_UNIT_PRICE]: '150000',
    [ClientPurchasesColumn.MATERIAL_PRICE]: '4500000',
    [ClientPurchasesColumn.PROCESSING_UNIT_PRICE]: '20000',
    [ClientPurchasesColumn.PROCESSING_PRICE]: '600000',
    [ClientPurchasesColumn.TOTAL_AMOUNT]: '5100000',
    [ClientPurchasesColumn.PAYING_AMOUNT]: '4500000',
    [ClientPurchasesColumn.REMAINING_AMOUNT]: '600000'
  }
];

export default clientPurchasesMock;