const invoiceMock = {
  supplierRegNo: '122-86-29029',
  supplierName: '대한금속이엔지(주)',
  businessNo: '122-86-29029',
  supplierRepresentative: '박신석',
  date: '2025년 02월 14일',
  previousBalance: 30414117, // 전미수 (이월금액)
  totalSales: 144595, // 매출계 (이번 거래 총액)
  depositAmount: 0, // 입금액
  remainingBalance: 30558712, // 미수계 (미납금)
  additionalInfo: '국와 거래전표 관리', // 추가 메모 내용
  items: [
    {
      name: 'H/L 1.2TX4X4000',
      quantity: 0.25,
      materialUnitPrice: 205260, // 재료단가
      processingUnitPrice: 35000, // 가공단가
      vCutProcessingFee: 0, // V컷 가공비
      totalAmount: 60065, // 최종 금액
    },
    {
      name: '갈바 1.55TX4X3000',
      quantity: 1,
      materialUnitPrice: 59530,
      processingUnitPrice: 25000,
      vCutProcessingFee: 0,
      totalAmount: 84530,
    },
  ],
};

export default invoiceMock;