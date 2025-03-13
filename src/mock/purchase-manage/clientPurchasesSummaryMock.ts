import {ClientPurchasesSummaryColumn} from '../../types/tableColumns.ts';

const clientPurchasesSummaryMock = [
  {
    [ClientPurchasesSummaryColumn.CLIENT]: '삼성전자',
    [ClientPurchasesSummaryColumn.MATERIAL_PRICE]: '5000000',
    [ClientPurchasesSummaryColumn.PROCESSING_PRICE]: '2000000',
    [ClientPurchasesSummaryColumn.TOTAL_AMOUNT]: '7000000',
    [ClientPurchasesSummaryColumn.PAYING_AMOUNT]: '5000000',
    [ClientPurchasesSummaryColumn.REMAINING_AMOUNT]: '2000000'
  },
  {
    [ClientPurchasesSummaryColumn.CLIENT]: 'LG화학',
    [ClientPurchasesSummaryColumn.MATERIAL_PRICE]: '3200000',
    [ClientPurchasesSummaryColumn.PROCESSING_PRICE]: '1500000',
    [ClientPurchasesSummaryColumn.TOTAL_AMOUNT]: '4700000',
    [ClientPurchasesSummaryColumn.PAYING_AMOUNT]: '4000000',
    [ClientPurchasesSummaryColumn.REMAINING_AMOUNT]: '700000'
  },
  {
    [ClientPurchasesSummaryColumn.CLIENT]: 'SK하이닉스',
    [ClientPurchasesSummaryColumn.MATERIAL_PRICE]: '8000000',
    [ClientPurchasesSummaryColumn.PROCESSING_PRICE]: '3000000',
    [ClientPurchasesSummaryColumn.TOTAL_AMOUNT]: '11000000',
    [ClientPurchasesSummaryColumn.PAYING_AMOUNT]: '7000000',
    [ClientPurchasesSummaryColumn.REMAINING_AMOUNT]: '4000000'
  },
  {
    [ClientPurchasesSummaryColumn.CLIENT]: '현대자동차',
    [ClientPurchasesSummaryColumn.MATERIAL_PRICE]: '6000000',
    [ClientPurchasesSummaryColumn.PROCESSING_PRICE]: '2500000',
    [ClientPurchasesSummaryColumn.TOTAL_AMOUNT]: '8500000',
    [ClientPurchasesSummaryColumn.PAYING_AMOUNT]: '6000000',
    [ClientPurchasesSummaryColumn.REMAINING_AMOUNT]: '2500000'
  },
  {
    [ClientPurchasesSummaryColumn.CLIENT]: '카카오',
    [ClientPurchasesSummaryColumn.MATERIAL_PRICE]: '4000000',
    [ClientPurchasesSummaryColumn.PROCESSING_PRICE]: '1800000',
    [ClientPurchasesSummaryColumn.TOTAL_AMOUNT]: '5800000',
    [ClientPurchasesSummaryColumn.PAYING_AMOUNT]: '5000000',
    [ClientPurchasesSummaryColumn.REMAINING_AMOUNT]: '800000'
  }
];
export default clientPurchasesSummaryMock;