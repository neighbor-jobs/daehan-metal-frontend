import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {formatCurrency, formatDate, formatDecimal} from '../src/utils/format.ts';
import {Ledger, Payment, Payroll, PayrollRegister} from './types/payroll.ts';

/**
 * 거래처별 매출현황
 */
export const companySalesDocDef = (companySalesData) => {
  // console.log('printData: ', companySalesData);
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
              {text: item['createdAt'], style: 'tableText'}, // 날짜
              {text: item['productName'], style: 'tableText'}, // 품명
              {text: item['scale'], style: 'tableText'}, // 규격
              {text: item['quantity'].toFixed(3), alignment: 'right', style: 'tableText'}, // 수량
              {text: formatCurrency(item['rawMatAmount']), alignment: 'right', style: 'tableText'}, // 재료비
              {text: formatCurrency(item['manufactureAmount']), alignment: 'right', style: 'tableText'}, // 가공비
              {text: item['amount'].toLocaleString(), alignment: 'right', style: 'tableText'}, // 금액
              {text: item['remainingAmount'].toLocaleString(), alignment: 'right'}, // 잔액
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

/**
 * 월별매입조회
 */
export const purchaseReceiptDocRef = (data): TDocumentDefinitions => {
  return {
    pageSize: 'A4', // A4 크기 유지
    pageMargins: [25, 20, 25, 20], // 좌 25, 상 20, 우 25, 하 20
    content: [
      {
        text: `${data.companyName}`,
        style: 'header',
        alignment: 'center',
        marginBottom: 5,
      },
      {
        text: `T ${data.telNumber}  F ${data.subTelNumber}  HP ${data.phoneNumber}  ${data.bankName} ${data.accountNumber}`,
        style: {
          fontSize: 8,
        },
        marginBottom: 5,
        alignment: 'center'
      },
      {
        table: {
          headerRows: 1,
          widths: ['10%', '20%', '*', '*', '10%', '10%', '8%', '10%', '10%', '12%'],
          body: [
            ['날짜', '품명', '세액', '수량', '단가', '매입금액', '매입세액', '합계', '입금', '잔액'].map(header => ({
              text: header,
              alignment: 'center',
            })),
            ...data.records.map((item: any) => [
              {text: item.createdAt, style: 'tableText', alignment: 'center'}, // 날짜
              {text: item.productName, style: 'tableText', alignment: 'center'}, // 품명
              {text: item.vat ? '별도' : '포함', style: 'tableText', alignment: 'center'}, // 세액 포함 여부
              {
                text: item.quantity ? Number(item.quantity).toLocaleString() : '',
                style: 'tableText',
                alignment: 'right'
              }, // 수량
              {
                text: item.unitPrice ? Number(item.unitPrice).toLocaleString() : '',
                style: 'tableText',
                alignment: 'right'
              }, // 단가
              {
                text: item.totalSalesAmount ? Number(item.totalSalesAmount).toLocaleString() : '-',
                style: 'tableText',
                alignment: 'right'
              }, // 매입금액
              {
                text: item.totalVatPrice ? Number(item.totalVatPrice).toLocaleString() : '-',
                style: 'tableText',
                alignment: 'right'
              }, // 매입세액
              {
                text: item.totalPrice ? Number(item.totalPrice).toLocaleString() : '',
                style: 'tableText',
                alignment: 'right'
              }, // 합계
              {
                text: item.productPrice ? Number(item.productPrice).toLocaleString() : '',
                style: 'tableText',
                alignment: 'right'
              }, // 입금
              {text: Number(item.payableBalance).toLocaleString(), style: 'tableText', alignment: 'right'}, // 잔액
            ]),
          ],
        },
      },
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 7,
    },
    styles: {
      header: {fontSize: 14},
      subheader: {fontSize: 10, marginBottom: 20},
    },
  }
}

/**
 * 매출처 리스트
 */
export const companyListDocRef = (data): TDocumentDefinitions => {
  const today = new Date();
  return {
    pageOrientation: 'landscape', // 🔥 페이지를 가로로 설정
    pageSize: 'A4', // A4 크기 유지
    pageMargins: [40, 20, 40, 30],
    header: (currPage, pageCount) => ({
      columns: [{text: `Page ${currPage} / ${pageCount}`, alignment: 'right'}],
      margin: [40, 10, 40, 0],
    }),
    content: [
      {
        text: `매출처리스트`,
        style: 'header',
        alignment: 'center',
      },
      {
        text: `출력일자: ${today.toISOString().split('T')[0]}`,
        style: {
          fontSize: 8,
          marginBottom: 5,
        },
      },
      {
        table: {
          headerRows: 1,
          widths: ['5%', '12%', '6%', '12%', '10%', '10%', '10%', '10%', '*'], // 칼럼 크기 조정
          body: [
            // 헤더
            ['연번', '거래처명', '대표자', '전화번호', '팩스번호', '사업자번호', '업태', '종목', '주소'].map(header => ({
              text: header,
              noWrap: true,
            })),
            // 데이터 행
            ...data.map((item: any, index: number) => [
              {text: `${index + 1}`, style: 'tableText', alignment: 'right'}, // 연번
              {text: item.companyName ?? '', style: 'tableText'}, // 거래처명
              {text: item.ownerName ?? '', style: 'tableText', alignment: 'right'}, // 대표자
              {text: item.phoneNumber ?? '', style: 'tableText', alignment: 'right'}, // 전화번호
              {text: item.fax ?? '', style: 'tableText', alignment: 'right'}, // 팩스
              {text: item.businessNumber ?? '', style: 'tableText', alignment: 'right'}, // 사업자 번호
              {text: truncateText(item.businessType ?? '', 10), style: 'tableText', alignment: 'right', noWrap: true}, // 업태
              {
                text: truncateText(item.businessCategory ?? '', 10),
                style: 'tableText',
                alignment: 'right',
                noWrap: true
              }, // 종목
              {
                text: item.address ?? '',
                style: 'tableText',
                alignment: 'right',
              }, // 주소
            ]),
          ],
        },
      },
      // 표 바깥에 텍스트 추가
      {
        text: '대한금속이엔지(주)',
        style: 'tableText',
        alignment: 'center',
        margin: [0, 10, 0, 0], // 여백 추가
      },
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 9,
    },
    styles: {
      header: {fontSize: 14},
      subheader: {fontSize: 10, marginBottom: 20},
    },
  };
};

/**
 * 거래처별 매출집계
 */
export const companySalesSumDocDef = (companySalesSumData) => {
  // console.log(companySalesSumData)
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

/**
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
          widths: ['*', '*', 'auto', '10%', '*', '10%', '*', '*'],
          body: [
            ['품명', '규격', '수량', '재료단가', '재료비', '가공단가', '가공비', '금액'].map(header => ({
              text: header,
            })),
            ...itemSalesSumData.data.map((item) => [
              {text: item['productName'], style: 'tableText'}, // 품명
              {text: item['scale'], style: 'tableText'}, // 규격
              {text: formatDecimal(item['quantity']), style: 'tableText'}, // 수량
              {text: formatCurrency(item['rawMatAmount']), style: 'tableText', alignment: 'right'}, // 재료 단가
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

/**
 * 미수금 현황
 */
/*
{
  data: [
    {
      companyName: '(구,동성)경영산업',
      salesAmount: '65317',
      payingAmount: '0',
      carryoverAmount: '0',
      outstandingAmount: '65317',
      phoneNumber: '010-2266-2022'
    }
  ],
  startAt: '2025-04-20',
  sumSalesAmount: '65,317',
  sumPayingAmount: '0',
  sumCarryoverAmount: '0',
  sumOutstandingAmount: '65,317'
}
*/
export const outstandingAmountDocDef = (outstandingAmount) => {
  const today = new Date();
  // console.log(outstandingAmount);
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
          widths: ['5%', '*', '*', '*', '*', '*', '*',],
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
              {text: outstandingAmount.sumCarryoverAmount, alignment: 'right'},
              {text: outstandingAmount.sumSalesAmount, alignment: 'right'},
              {text: outstandingAmount.sumPayingAmount, alignment: 'right'},
              {text: outstandingAmount.sumOutstandingAmount, alignment: 'right'},
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

/**
 * 거래명세서
 */
const basicInvoiceTable = (data, index) => {
  /* data 형식 */
  /*
 {
  companyId: 'bc93a48e-fd33-42bc-ba63-bee54f57a9f6',
  locationName: [ 'dd' ],
  companyName: '(주) 더아트팩토리리',
  payingAmount: '0',
  sequence: 6,
  createdAt: '2025-04-20',
  choices: [
    {
      bridgeId: 'b1fcabcf-a129-40c9-9ec4-1e661b5957c9',
      productName: '티타블H/L',
      quantity: 1.25,
      productScale: '1.2TX4X3000',
      productScaleSequence: 2
    }
  ],
  amount: [
    {
      cachedRawMatAmount: '0',
      cachedManufactureAmount: '0',
      newRawMatAmount: '10000',
      newManufactureAmount: '40900'
    }
  ]
}
*/
  // console.log(data);
  const text = index === 0 ? '(공급자보관용)' : '(공급받는자보관용)'
  const totalRowsNum = data.sales.length > 15 ? 25 : 15;
  const shouldPageBreak = index === 1 && totalRowsNum === 25;
  const sum = data.sales.map((item) => (Number(item.rawMatAmount) + Number(item.manufactureAmount)) * item.quantity)
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
      ...(shouldPageBreak ? {pageBreak: 'before'} : {}),
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
          ...data.sales.map((item, index) => [
            {text: `${item.productName}`},
            {text: `${item.productScale || item.scale}`},
            {text: `${item.quantity.toFixed(3)}`, alignment: 'right'},
            {text: `${formatCurrency(item.rawMatAmount)}`, alignment: 'right'},
            {text: `${formatCurrency(item.manufactureAmount)}`, alignment: 'right'},
            {text: `${sum[index].toLocaleString('ko-KR')}`, alignment: 'right'},
          ]),
          ...Array.from({length: totalRowsNum - data.sales.length}, () =>
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
        ],
      },
    },
  ];
}

export const invoiceDocDef = (data: any) => {
  /*
  *{
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
  * */
  const totalRowsNum = data.sales?.length > 12 ? 25 : 12;

  const docDef: TDocumentDefinitions = {
    pageMargins: [40, 10, 40, 20],
    content: [
      ...basicInvoiceTable(data, 0),
      ...(totalRowsNum !== 25
          ? [{
            canvas: [
              {
                type: "line",
                x1: 0, y1: 0,
                x2: 530, y2: 0,
                lineWidth: 0.5,
                dash: {length: 2, space: 2}
              }
            ],
            margin: [0, 5, 0, 5]
          } as any]
          : []
      ),
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

/**
 * payment 생성
 */
const createPayrollRegisterContent = (payrollRegisterData: Payroll): any[] => {
  const [year, month, day]: string[] = (payrollRegisterData.createdAt).split('T')[0]?.split("-");
  const payments = payrollRegisterData.payments
  const widths = Array.from({length: payments.length + 1}, () => '*')
  const spacer = Array.from({length: widths.length}, () => ({text: ''}))
  widths[0] = '15%'

  const headers: any[][] = [[{text: "작성일자", style: 'subheader'}], [{
    text: `${year}-${month}-${day}`,
    style: 'subheader'
  }]]
  const employees: any[] = [{text: "성명", style: 'subheader'}]
  const salaryDetails: object = {
    '기본급': [{text: "기본급", style: 'subheader'}],
    '시급': [{text: "시급", style: 'subheader'}],
    '연장 근무시간': [{text: "연장 근무시간", style: 'subheader'}],
    '연장수당': [{text: "연장수당", style: 'subheader'}],
    '휴일 근무시간': [{text: "휴일 근무시간", style: 'subheader'}],
    '휴일 근무수당': [{text: "휴일 근무수당", style: 'subheader'}],
    '연차수당': [{text: "연차수당", style: 'subheader'}],
    '식대': [{text: "식대", style: 'subheader'}],
  }
  const deductionDetails: object = {}
  const deductions: any[] = [{text: "공제액계", style: 'subheader', alignment: 'center'}]
  const salarys: any[] = [{text: "수령액계", style: 'subheader', alignment: 'center'}]
  const totalSalarys: any[] = [{text: "실수령액", style: 'subheader', alignment: 'center'}]

  for (let i = 0; i < payments[0].deductionDetail.length; ++i) {
    deductionDetails[`${payments[0].deductionDetail[i]['purpose']}`] = [{
      text: payments[0].deductionDetail[i]['purpose'],
      style: 'subheader'
    }]
  }

  for (let i = 0; i < payments.length; ++i) {
    const payment = payments[i]
    headers[0].push({text: payment.memo, style: 'cell', alignment: 'center'})
    headers[1].push({text: payment.employeePosition, style: 'cell', alignment: 'center'})
    employees.push({text: payment.employeeName, style: 'cell', alignment: 'center'})

    salaryDetails['기본급'].push({text: `${formatCurrency(payment.paymentDetail.pay)} 원`, style: 'cell', alignment: 'center'})
    salaryDetails['시급'].push({text: `${formatCurrency(payment.paymentDetail.hourlyWage)} 원`, style: 'cell', alignment: 'center'})
    salaryDetails['연장 근무시간'].push({
      text: `${payment.paymentDetail.extendWorkingTime}시간`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['연장수당'].push({
      text: `${formatCurrency(payment.paymentDetail.extendWokringWage)} 원`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['휴일 근무시간'].push({
      text: `${payment.paymentDetail.dayOffWorkingTime}시간`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['휴일 근무수당'].push({
      text: `${formatCurrency(payment.paymentDetail.dayOffWorkingWage)} 원`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['연차수당'].push({
      text: `${formatCurrency(payment.paymentDetail.annualLeaveAllowance)} 원`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['식대'].push({text: `${formatCurrency(payment.paymentDetail.mealAllowance)} 원`, style: 'cell', alignment: 'center'})
    deductions.push({text: `${formatCurrency(payment.deduction)} 원`, style: 'cell', alignment: 'center'})
    salarys.push({text: `${formatCurrency(payment.salary)} 원`, style: 'cell', alignment: 'center'})
    totalSalarys.push({text: `${formatCurrency(payment.totalSalary)} 원`, style: 'cell', alignment: 'center'})

    for (let j = 0; j < payment.deductionDetail.length; ++j) {
      deductionDetails[payment.deductionDetail[j]['purpose']].push({
        text: `${formatCurrency(payment.deductionDetail[j]['value'])} 원`,
        style: 'cell',
        alignment: 'center'
      })
    }
  }

  return [
    {
      text: `${year}년 ${month}월 급여대장`,
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 10],
      fontSize: 15,
    },
    {
      table: {
        widths,
        body: [
          headers[0],
          headers[1],
          employees,
          // spacer,
          ...Object.keys(salaryDetails).map((key) => salaryDetails[key]),
          salarys,
          // spacer,
          ...Object.keys(deductionDetails).map((key) => deductionDetails[key]),
          deductions,
          // spacer,
          totalSalarys,
          spacer,
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    },
  ]
}

/**
 * ledger 생성
 */
const createFinancialLedgerContent = (financialLedgerData: Ledger): any[] => {
  const payingExpensesData: any[][] = []
  let data: any[][] = [[], []]

  for (let i = 0; i < financialLedgerData.payingExpenses.length; ++i) {
    const payingExpenses = financialLedgerData.payingExpenses[i]
    data[0].push({text: payingExpenses['purpose'], style: 'subheader', alignment: 'center'})
    data[1].push({text: `${formatCurrency(payingExpenses['value'])} 원`, style: 'cell', alignment: 'center'})

    if (data[0].length > 7) {
      payingExpensesData.push(data)
      data = [[], []]
    }
  }

  if (data[0].length > 0 && data[0].length < 8) {
    for (let i = 0; i < 8; ++i) {
      if (!data[0][i]) {
        data[0][i] = {}
        data[1][i] = ''
      }
    }
    payingExpensesData.push(data)
  }

  const paymentsColumns = [...payingExpensesData.flatMap((data) => [data[0], data[1]])]

  const groups = Object.keys(financialLedgerData.calcGroups)
  const groupCalcs = [[], []]
  for (let i = 0; i < groups.length; ++i) {
    const group = groups[i]
    groupCalcs[0].push({text: group, style: 'subheader'})
    groupCalcs[1].push({
      text: `${formatCurrency(String(financialLedgerData.calcGroups[group]))} 원`,
      style: 'cell',
      alignment: 'center'
    })
  }

  if (groupCalcs[0].length > 0 && groupCalcs[0].length < 8) {
    for (let i = 0; i < 8; ++i) {
      if (!groupCalcs[0][i]) {
        groupCalcs[0][i] = {}
        groupCalcs[1][i] = ''
      }
    }
  }

  return [
    {
      text: `지출내역`,
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 10],
      fontSize: 12,
    },
    {
      table: {
        widths: ["*", "*", "*", "*", "*", "*", "*", "*"],
        body: paymentsColumns,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        widths: ["*", "*", "*", "*", "*", "*", "*", "*"],
        body: groupCalcs,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    },
    {
      text: `합계: ${formatCurrency(String(groupCalcs[1].reduce((acc, curr) => typeof curr === "object" && curr['text'] ? acc + Number(curr['text'].replace(/,/g, "").split(" ")[0]) : acc, 0)))} 원`,
      style: 'header',
      alignment: 'right',
    }
  ]
}

/**
 * 급여대장
 */
export const payrollRegisterDocRef = (data: PayrollRegister): TDocumentDefinitions => {
  const payrollRegisterContent = createPayrollRegisterContent(data.payrollRegister)
  const financialLedger = createFinancialLedgerContent(data.financialLedger)

  return {
    pageSize: 'A4',
    pageMargins: [20, 20, 20, 20],
    content: [
      // 급여대장
      ...payrollRegisterContent,
      // 지출내역
      ...financialLedger,
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 7,
    },
    styles: {
      header: {fontSize: 12},
      subheader: {fontSize: 8, alignment: 'center', margin: [0, 2, 0, 2]},
      cell: {fontSize: 7, margin: [0, 2, 0, 2]},
      footer: {fontSize: 7, marginTop: 10},
    },
  };
}

/**
 * 급여명세서(1개)
 * */
const getSalaryContent = (data: Payment): any[]  => {
  const [year, month] = data.createdAt.split('-');
  const today = formatDate(new Date());
  let deductions: any[][] = []
  let deduction:
    any[][] = [[], []]

  for (let i = 0; i < data.deductionDetail.length; ++i) {
    const deductionDetail = data.deductionDetail[i];
    if (deductionDetail.purpose.length === 0) continue;

    deduction[0].push({text: deductionDetail['purpose'], style: 'cell'})
    deduction[1].push(`${deductionDetail['value']} 원`)

    if (deduction[0].length > 2) {
      deductions.push(deduction)
      deduction = [[], []]
    }
  }

  if (deduction[0].length >= 0) {
    if (deduction[0].length < 3) {
      for (let i = 0; i < 3; ++i) {
        if (!deduction[0][i]) {
          deduction[0][i] = {}
          deduction[1][i] = ''
        }
      }
    }
    deductions.push(deduction)
  }
  deductions = deductions.flatMap((deduction) => [deduction[0], deduction[1]])
  console.log(deductions)
  // content만 반환
  return [
    {
      text: `대한금속ENG(주) ${year}년 ${month} 급여명세서 ${today}`,
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 10],
    },
    {
      columns: [
        {width: "20%", text: `${data.employeeName} 님`, style: 'subheader', fontSize: 12},
        {width: "20%", text: `총 근무일: ${data.paymentDetail.workingDay} 일`, style: 'subheader'},
        {width: "60%", text: `사번 ${data.id}`, alignment: 'right', style: 'subheader'},
      ],
      margin: [0, 0, 0, 10],
    },
    {
      text: '수령액',
      style: 'header',
      alignment: "left",
      fontSize: 10,
    },
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            {text: '기본급', style: 'cell'},
            {text: '시급', style: 'cell'},
            {text: '식대', style: 'cell'}
          ],
          [
            `${data.paymentDetail.pay} 원`,
            `${data.paymentDetail.hourlyWage} 원`,
            `${data.paymentDetail.mealAllowance} 원`,
          ],
          [
            {text: '연장 근무시간', style: 'cell'},
            {text: '연장 근무수당', style: 'cell'},
            {}
          ],
          [
            `${data.paymentDetail.extendWorkingTime} 시간`,
            `${data.paymentDetail.extendWokringWage} 원`,
            ''
          ],
          [
            {text: '휴일 근무시간', style: 'cell'},
            {text: '휴일 근무수당', style: 'cell'},
            {}
          ],
          [
            `${data.paymentDetail.dayOffWorkingTime} 시간`,
            `${data.paymentDetail.dayOffWorkingWage} 원`,
            '',
          ],
          [
            {text: '연차수당 (연차+월차)', style: 'cell'},
            {},
            {},
          ],
          [
            `${data.paymentDetail.annualLeaveAllowance} 원`,
            '',
            '',
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    },
    {text: "\n"},
    {
      text: '공제액',
      style: 'header',
      alignment: "left",
      fontSize: 10,
    },
    {
      table: {
        widths: ['*', '*', '*'],
        body: deductions,
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            {text: '수령액계', style: 'cell'},
            {text: '공제액계', style: 'cell'},
            {text: '실수령액', style: 'cell'},
          ],
          [
            `${data.salary} 원`,
            `${data.deduction} 원`,
            `${data.totalSalary} 원`,
          ],
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    },
    {
      text: '귀하의 노고에 감사드립니다.',
      alignment: 'center',
      style: 'footer',
    },
    // 마지막에 pageBreak 추가
    { text: '', pageBreak: 'after' }
  ];
}

/**
 * 급여명세서(summary)
 * */
export const salaryDocsRef = (datas: Payment[]): TDocumentDefinitions => {
  // 각 사원별 content를 합침
  const allContents: any[] = [];
  datas.forEach((data, idx) => {
    const content = getSalaryContent(data);
    // 마지막 사원은 pageBreak 제거
    if (idx === datas.length - 1) {
      if (content[content.length - 1]?.pageBreak) {
        content.pop();
      }
    }
    allContents.push(...content);
  });

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 30],
    content: allContents,
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 9,
    },
    styles: {
      header: { fontSize: 14 },
      subheader: { fontSize: 10, marginBottom: 5 },
      cell: { fontSize: 9, margin: [0, 5, 0, 5] },
      footer: { fontSize: 9, marginTop: 10 },
    }
  };
};


/**
 * 긴 문자열을 일정 길이에서 자르고 "..."을 붙여주는 함수
 */
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};