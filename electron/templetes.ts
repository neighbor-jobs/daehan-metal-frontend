import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {formatDecimal, formatCurrency} from '../src/utils/format.ts';

/*
* 거래처별 매출현황
*/
export const companySalesDocDef = (companySalesData) => {
  console.log('printData: ', companySalesData);
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
        text: `${companySalesData.companyName} 매출 현황`,
        style: 'header',
        alignment: 'center',
      },
      {
        text: `검색기간: ${companySalesData.startAt} ~ ${companySalesData.endAt}`,
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
          widths: ['*', '*', 'auto', '*', '*', '*', '*', '*'],
          body: [
            ['날짜', '품명', '규격', '수량', '재료비', '가공비', '금액', '잔액'].map(header => ({
              text: header,
            })),
            ...companySalesData.data.map((item) => [
              {text: item['date'], style: 'tableText'}, // 날짜
              {text: item['item'], style: 'tableText'}, // 품명
              {text: item['size'], style: 'tableText'}, // 규격
              {text: formatDecimal(item['count']), alignment: 'right', style: 'tableText'}, // 수량
              {text: formatCurrency(item['material-price']), alignment: 'right', style: 'tableText'}, // 재료비
              {text: formatCurrency(item['processing-price']), alignment: 'right', style: 'tableText'}, // 가공비
              {text: formatCurrency(item['amount']), alignment: 'right', style: 'tableText'}, // 금액
              {text: formatCurrency(item['remaining-amount']), alignment: 'right'}, // 잔액
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
export const companySalesSumDocDef = (companySalesSumData) => {
  console.log(companySalesSumData)
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
        text: `거래처별 매출집계`,
        style: 'header',
        alignment: 'center',
      },
      {
        text: `검색기간: ${companySalesSumData.startAt} ~ ${companySalesSumData.endAt}`,
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
          widths: ['*', '*', '*', '*', '*', '*',],
          body: [
            ['거래처명', '재료비', '가공비', '입금액', '총액', '잔액'].map(header => ({
              text: header,
            })),
            ...companySalesSumData.data.map((item: any) => [
              {text: item['company-name'], style: 'tableText'}, // 품명 (거래처명)
              {text: Number(item['material-price']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 재료비
              {text: Number(item['processing-price']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 가공비
              {text: Number(item['paying-amount']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 총 금액
              {text: Number(item['total-amount']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 수금액
              {text: Number(item['remaining-amount']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 잔액
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
export const itemSalesSumDocDef = (itemSalesSumData) => {
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
        text: `검색기간: ${itemSalesSumData.startAt} ~ ${itemSalesSumData.endAt}`,
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
            ...itemSalesSumData.data.map((item) => [
              {text: item['productName'], style: 'tableText'}, // 품명
              {text: item['scale'], style: 'tableText'}, // 규격
              {text: formatDecimal(item['quantity']), style: 'tableText'}, // 수량
              {text: formatCurrency(item['rawMatAmount']), style: 'tableText' , alignment: 'right'}, // 재료 단가
              {text: formatCurrency(item['totalRawMatAmount']), style: 'tableText', alignment: 'right'}, // 재료비
              {text: formatCurrency(item['manufactureAmount']), style: 'tableText', alignment: 'right'}, // 가공 단가
              {text: formatCurrency(item['totalManufactureAmount']), style: 'tableText', alignment: 'right'}, // 가공비
              {text: formatCurrency(item['totalSalesAmount']), style: 'tableText', alignment: 'right'}, // 금액
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
export const outstandingAmountDocDef = (outstandingAmount) => {
  const today = new Date();
  console.log(outstandingAmount);
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
        text: `검색기간: ${outstandingAmount.startAt}`,
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
            ...outstandingAmount.data.map((item, idx) => [
              {text: `${idx + 1}`, style: 'tableText'}, // 연번
              {text: item['companyName'], style: 'tableText'}, // 거래처명
              {text: formatCurrency(item['carryoverAmount']), style: 'tableText', alignment: 'right'}, // 이월액
              {text: formatCurrency(item['salesAmount']), style: 'tableText', alignment: 'right'}, // 매출액
              {text: formatCurrency(item['payingAmount']), style: 'tableText', alignment: 'right'}, // 입금액
              {text: formatCurrency(item['outstandingAmount']), style: 'tableText', alignment: 'right'}, // 미수금
              {text: item['phoneNumber'], style: 'tableText'}, // 전화번호
            ]),
            [
              {text: '합   계', colSpan: 2}, '',
              {text: formatCurrency(outstandingAmount.sumCarryoverAmount), alignment: 'right'},
              {text: formatCurrency(outstandingAmount.sumSalesAmount), alignment: 'right'},
              {text: formatCurrency(outstandingAmount.sumPayingAmount), alignment: 'right'},
              {text: formatCurrency(outstandingAmount.sumOutstandingAmount), alignment: 'right'},
              ''
            ]
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

/*
* 거래명세서
*/

const basicInvoiceTable = (data, index) => {
  /* data 형식 */
  /*{
    companyId: '530bf5a3-21c4-4241-9b91-e378b05966ed',
      locationName: [],
    companyName: '하림창호',
    payingAmount: '0',
    sequence: 1,
    createdAt: '2025-03-28',
    choices: [
    {
      bridgeId: '7d667736-21e3-4724-8ba2-ae595fe41ec9',
      productName: 'H/L',
      quantity: 2,
      productScale: '0.8TX1X1600',
      productScaleSequence: 2
    }
  ],
    amount: [
    {
      cachedRawMatAmount: '0',
      cachedManufactureAmount: '0',
      newRawMatAmount: '3000',
      newManufactureAmount: '2000'
    }
  ]
  }
*/
  const text = index === 0 ? '(공급자보관용)' : '(공급받는자보관용)'
  const sum = data.choices.map((item, index) => (Number(data.amount[index].newRawMatAmount) + Number(data.amount[index].newManufactureAmount)) * item.quantity)
  const [firstRowNames, secondRowNames] =
    data.locationName.length > 3
      ? [data.locationName.slice(0, 3), data.locationName.slice(3)]
      : [data.locationName, []];
  return [
    {
      table: {
        widths: ['*', '*', 'auto', '*', 'auto', 'auto', '*'],
        body: [
          [{
            text: '거    래    명    세    서',
            style: 'header',
            colSpan: 6,
            alignment: 'center',
            border: [true, true, false, true]
          }, '', '', '', '', '',
            {text: `${text}`, alignment: 'right', border: [false, true, true, true]}
          ],
          [
            {
              text: `${data.createdAt}\n\n\u00A0\u00A0\u00A0${data.companyName}\u00A0\u00A0\u00A0\u00A0귀하\n\n\u00A0\u00A0\u00A0아래와 같이 계산합니다.`,
              rowSpan: 4,
              colSpan: 2
            }, '',
            {text: '공        급        자', colSpan: 5, alignment: 'center'}, '', '', '', ''
          ],
          ['', '', {text: '등 록 번 호', alignment: 'center'},
            {text: '122 - 86 - 29029', colSpan: 4, alignment: 'center'}, '', '', ''
          ],
          ['', '',
            {text: '상 호', alignment: 'center'},
            {text: '대한금속이엔지(주)', colSpan: 2, alignment: 'center'}, '',
            {text: '성 명', alignment: 'center'},
            {text: '박신석', alignment: 'center'}
          ],
          ['', '',
            {text: '사 업 장 주 소', alignment: 'center'},
            {text: '인천 계양구 평리길 92(평동 85-3)', colSpan: 4, alignment: 'center'}, '', '', ''
          ],
          [{text: `현장명 : ${firstRowNames?.join(', ')}`, colSpan: 2, border: [true, true, true, false]}, '',
            {text: '업 태', alignment: 'center'},
            {text: '제조업', alignment: 'center'},
            {text: '종 목', alignment: 'center'},
            {text: '일반철물제작', colSpan: 2, alignment: 'center'}, ''
          ],
          [{text: `${secondRowNames?.join(', ')}`, colSpan: 2, border: [true, false, true, true]}, '',
            {text: '전 화', alignment: 'center'},
            {text: '032-543-2756,7', alignment: 'center'},
            {text: '팩 스', alignment: 'center'},
            {text: '032-543-2763', colSpan: 2, alignment: 'center'}, ''
          ],
        ],
      },
    },
    {
      table: {
        widths: ['*', '*', 50, '*', '*', '*'],
        body: [
          [
            {text: '품  목', alignment: 'center', border: [true, false, true, true]},
            {text: '규  격', alignment: 'center', border: [true, false, true, true]},
            {text: '수  량', alignment: 'center', border: [true, false, true, true]},
            {text: '재료단가', alignment: 'center', border: [true, false, true, true]},
            {text: '가공단가', alignment: 'center', border: [true, false, true, true]},
            {text: '계', alignment: 'center', border: [true, false, true, true]}
          ],
          ...data.choices.map((item, index) => [
            {text: `${item.productName}`},
            {text: `${item.productScale || item.scale}`},
            {text: `${item.quantity.toFixed(3)}`, alignment: 'right'},
            {text: `${formatCurrency(data.amount[index].newRawMatAmount)}`, alignment: 'right'},
            {text: `${formatCurrency(data.amount[index].newManufactureAmount)}`, alignment: 'right'},
            {text: `${sum[index].toLocaleString('ko-KR')}`, alignment: 'right'},
          ]),
          ...Array.from({length: 12 - data.choices.length}, () =>
            Array.from({length: 6}, () => ({
              text: ' ',
            }))
          ),
          [{
            columns: [
              {text: `전미수: ${formatCurrency(data.carryoverAmount)} `},
              {text: `매출계: ${formatCurrency(data.totalSalesAmount)} `},
              {text: `입금액: ${formatCurrency(data.payingAmount)}`},
              {text: `미수계: ${(Number(data.carryoverAmount) + Number(data.totalSalesAmount) - Number(data.payingAmount)).toLocaleString()}`},
            ],
            colSpan: 6,
          }, '', '', '', '', ''],
          [{text: '', border: [true, true, false, true], colSpan: 4}, '', '', '',
            {text: '인수자 : ', border: [false, true, false, true]},
            {text: '(인)', border: [false, true, true, true]},
          ]
        ]
      },
    },
  ];
}

export const invoiceDocDef = (data: any) => {
  console.log(data);
  /*
  *   /*{
  companyId: 'dbf69606-797b-4f78-8c4a-bd6ddbfda2da',
  locationName: [],
  companyName: '푸주옥',
  payingAmount: '0',
  sequence: 2,
  createdAt: '2025-03-29',
  choices: [
    {
      bridgeId: '375dc75a-1796-46e4-84dc-0509d3b6dcfb',
      productName: '회색징크',
      quantity: 0,
      productScale: '0.5TX4X3000',
      productScaleSequence: 2
    }
  ],
  amount: [
    {
      cachedRawMatAmount: '200',
      cachedManufactureAmount: '300',
      newRawMatAmount: '200',
      newManufactureAmount: '300'
    }
  ]
}

  *
  * */

  const docDef: TDocumentDefinitions = {
    content: [
      ...basicInvoiceTable(data, 0),
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 530, y2: 0, // 너비 조절 (A4 기준이면 약 500~550 추천)
            lineWidth: 0.5,
            dash: {length: 2, space: 2}
          }
        ],
        margin: [0, 15, 0, 15]
      },
      ...basicInvoiceTable(data, 1),
    ],
    styles: {
      header: {
        fontSize: 12,
      },
      subheader: {
        fontSize: 14,
      },
    },
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 9,
    },
  };
  return docDef;
};