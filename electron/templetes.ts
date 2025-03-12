import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {formatDecimal} from '../src/utils/format.ts';

/*
* 거래처별 매출현황
* TODO: 전일이월 직접 적으시는건지 자동으로 템플릿에 나오는건지?
*/
export const companySalesDocDef = (date: Date, companyName: string, companySalesData: any[]) => {
  const today = new Date();
  const docDef: TDocumentDefinitions = {
    header: (currentPage, pageCount) => ({
      columns: [
        {text: `Page ${currentPage} / ${pageCount}`, alignment: 'right'},
      ],
      margin: [40, 10, 40, 0], // 좌우 여백 조정
    }),
    content: [
      {
        text: `${companyName} 매출 현황`,
        style: 'header',
        alignment: 'center',
      },
      {
        text: `검색기간: ${date.toLocaleString('ko-KR')}`,
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: `출력일자: ${today.toLocaleString('ko-KR')}`,
        style: {
          fontSize: 8,
          marginBottom: 5,
        }
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', '*', '*', 'auto', '*', '*', '*'],
          body: [
            ['날짜', '품명', '수량', '재료비', '가공비', 'V컷수', '금액', '수금액', '잔액'].map(header => ({
              text: header,
            })),
            ...companySalesData.map((item) => [
              {text: item['item'], style: 'tableText'}, // 품명
              {text: item['size'], style: 'tableText'}, // 규격
              {text: formatDecimal(item['count']), style: 'tableText'}, // 수량
              {text: item['material-price'], style: 'tableText'}, // 재료비
              {text: item['processing-price'], style: 'tableText'}, // 가공비
              {text: item['vcut-count'], style: 'tableText'}, // v컷수
              {text: item['amount'], style: 'tableText'}, // 금액
              {text: item['received-amount'], style: 'tableText'}, // 수금액
              {text: item['remaining-amount'], style: 'tableText'}, // 잔액
            ]),
          ],
        },
      },
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 8,
    },
    styles: {
      header: {fontSize: 14,},
      subheader: {fontSize: 10, marginBottom: 20},
    }
  }
  return docDef;
}

/*
* 거래처별 매출집계
*/
export const companySalesSumDocDef = (companyName: string, date: Date, companySalesSumData: any[]) => {
  const today = new Date();
  const docDef: TDocumentDefinitions = {
    header: (currentPage, pageCount) => ({
      columns: [
        {text: `Page ${currentPage} / ${pageCount}`, alignment: 'right'},
      ],
      margin: [40, 10, 40, 0], // 좌우 여백 조정
    }),
    content: [
      {
        text: `${companyName} 매출집계`,
        style: 'header',
        alignment: 'center',
      },
      {
        text: `검색기간: ${date.toISOString().split('T')[0]}`,
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: `출력일자: ${today.toISOString().split('T')[0]}`,
        style: {
          fontSize: 8,
          marginBottom: 5,
        }
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*'], // ✅ Full Width 적용
          body: [
            ['날짜', '품명', '수량', '재료비', '가공비', 'V컷가공비', '금액', '수금액', '잔액'].map(header => ({
              text: header,
            })),
            ...companySalesSumData.map((item: any) => [
              {text: new Date().toISOString().split('T')[0], style: 'tableText'}, // 임시 날짜
              {text: item.client, style: 'tableText'}, // 품명 (거래처명)
              {text: '1', style: 'tableText'}, // 수량 (기본값 1)
              {text: Number(item['material-price']).toLocaleString(), style: 'tableText'}, // 재료비
              {text: Number(item['processing-price']).toLocaleString(), style: 'tableText'}, // 가공비
              {text: Number(item['vcut-processing-price']).toLocaleString(), style: 'tableText'}, // V컷 가공비
              {text: Number(item['total-amount']).toLocaleString(), style: 'tableText'}, // 총 금액
              {text: Number(item['received-amount']).toLocaleString(), style: 'tableText'}, // 수금액
              {text: Number(item['remaining-amount']).toLocaleString(), style: 'tableText'}, // 잔액
            ]),
          ],
        },
      },
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 9,
    },
    styles: {
      header: {fontSize: 14,},
      subheader: {fontSize: 10, marginBottom: 20},
    },
  };
  return docDef;
}

/*
* 품목별 매출집계
*/
export const itemSalesSumDocDef = (date: Date, itemSalesSumData: any[]) => {
  const today = new Date();
  const docDef: TDocumentDefinitions = {
    header: (currentPage, pageCount) => ({
      columns: [
        {text: `Page ${currentPage} / ${pageCount}`, alignment: 'right'},
      ],
      margin: [40, 10, 40, 0], // 좌우 여백 조정
    }),
    content: [
      {
        text: '품목별 매출 집계',
        style: 'header',
        alignment: 'center',
      },
      {
        text: `검색기간: ${date.toLocaleString('ko-KR')}`,
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: `출력일자: ${today.toLocaleString('ko-KR')}`,
        style: {
          fontSize: 8,
          marginBottom: 5,
        }
      },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', 'auto', 'auto', '*', 'auto', '*', '*'],
          body: [
            ['품명', '규격', '수량', '재료단가', '재료비', '가공단가', '가공비', '금액'].map(header => ({
              text: header,
            })),
            ...itemSalesSumData.map((item) => [
              {text: item['item'], style: 'tableText'}, // 품명
              {text: item['size'], style: 'tableText'}, // 규격
              {text: formatDecimal(item['count']), style: 'tableText'}, // 수량
              {text: item['material-unit-price'], style: 'tableText'}, // 재료 단가
              {text: item['material-price'], style: 'tableText'}, // 재료비
              {text: item['processing-unit-price'], style: 'tableText'}, // 가공 단가
              {text: item['processing-price'], style: 'tableText'}, // 가공비
              {text: item['amount'], style: 'tableText'}, // 금액
            ]),
          ],
        },
      },
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 8,
    },
    styles: {
      header: {fontSize: 14,},
      subheader: {fontSize: 10, marginBottom: 20},
    }
  }
  return docDef;
}

/*
* 미수금 현황
*/
export const outstandingAmountDocDef = (date: Date, outstandingAmount: any[]) => {
  const today = new Date();
  const docDef: TDocumentDefinitions = {
    header: (currentPage, pageCount) => ({
      columns: [
        {text: `Page ${currentPage} / ${pageCount}`, alignment: 'right'},
      ],
      margin: [40, 10, 40, 0], // 좌우 여백 조정
    }),
    content: [
      {
        text: '미수금현황',
        style: 'header',
        alignment: 'center',
      },
      {
        text: `검색기간: ${date.getFullYear()}.${date.getMonth()}`,
        style: 'subheader',
        alignment: 'center',
      },
      {
        text: `출력일자: ${today.toLocaleString('ko-KR')}`,
        style: {
          fontSize: 8,
          marginBottom: 5,
        }
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', '*', '*', '*', '*', '*',],
          body: [
            ['연번', '거래처명', '이월액', '매출액', '입금액', '미수금액', '전화번호'].map(header => ({
              text: header,
            })),
            ...outstandingAmount.map((item, idx) => [
              {text: `${idx + 1}`, style: 'tableText'}, // 연번
              {text: item['client'], style: 'tableText'}, // 거래처명
              {text: item['carryover-amount'], style: 'tableText'}, // 이월액
              {text: item['sales-amount'], style: 'tableText'}, // 매출액
              {text: item['paying-amount'], style: 'tableText'}, // 입금액
              {text: item['outstanding-amount'], style: 'tableText'}, // 미수금
              {text: item['phone-number'], style: 'tableText'}, // 전화번호
            ]),
          ],
        },
      },
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 9,
    },
    styles: {
      header: {fontSize: 14,},
      subheader: {fontSize: 10, marginBottom: 20},
    }
  }
  return docDef;
}