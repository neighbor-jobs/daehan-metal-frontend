import {TDocumentDefinitions} from 'pdfmake/interfaces';
import {formatCurrency, formatDate, formatDecimal} from '../src/utils/format.ts';
import {Ledger, Payment, Payroll, PayrollRegister} from './types/payroll.ts';

const A4_W = 630;
const A4_H = 845;
const PAGE_SCALE = 1; // 94% 정도부터 시도 (필요시 0.92, 0.90로 낮추기)
const headerSpacing = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
const basicTableLayout = {
  hLineWidth: () => 0.4,
  vLineWidth: () => 0.4,
  paddingLeft: () => 1,
  paddingRight: () => 1,
  // paddingTop: () => 1,
  // paddingBottom: () => 1,
}

/**
 * 일별매출현황
 */
export const dailySalesDocDef = (dailySalesData) => {
  // console.log(dailySalesData)
  const today = new Date();
  const totalAmount =
    Number(dailySalesData.amount.totalRawMatAmount)
    + Number(dailySalesData.amount.totalManufactureAmount)
    + Number(dailySalesData.amount.totalVatAmount)
    + Number(dailySalesData.amount.totalDeliveryCharge)
    - dailySalesData.amount.totalPayingAmount
  const docDef: TDocumentDefinitions = {
    /*pageSize: {
      width: A4_W * PAGE_SCALE,
      height: A4_H * PAGE_SCALE,
    },*/
    pageMargins: [24, 20, 24, 20],
    header: (currentPage, pageCount) => ({
      columns: [
        {text: `Page ${currentPage} / ${pageCount}`, alignment: 'right'},
      ],
      margin: [15, 20, 15, 0], // 좌우 여백 조정
    }),
    content: [
      {
        text: `일별 매출 현황`,
        style: 'header',
        alignment: 'center',
      },
      {
        text: `검색기간: ${dailySalesData.startAt} ~ ${dailySalesData.endAt}`,
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
          widths: ['auto', 70, 70, 80, 30, 52, 52, 40, 40, 53],
          body: [
            ['날짜', '거래처명', '품명', '규격', '수량', '재료비', '가공비', '세액', '운임비', '금액'].map(header => ({
              text: header,
              alignment: 'center'
            })),
            // eslint-disable-next-line no-unsafe-optional-chaining
            ...dailySalesData.dailySalesList?.map((item) => {
              /* 입금인지 아닌지 구분 */
              let amount: number;
              if (item.payingAmount) amount = -Number(item.payingAmount);
              else amount = item.totalRawMatAmount + item.totalManufactureAmount + Number(item.vatAmount) + Number(item.deliveryCharge)

              /* 수량 소숫점 표시 */
              const quantity = item.productName === '입금액' ? '' : Number(item['quantity']).toFixed(3).replace(/\.?0+$/, '')
              return [
                {text: item['createdAt']?.split('T')[0], style: 'tableText'}, // 날짜
                {text: item['companyName'], style: 'tableText'}, // 거래처명
                {text: item['productName'], style: 'tableText'}, // 품명
                {text: item['scale'], style: 'tableText'}, // 규격
                {text: quantity, alignment: 'right', style: 'tableText'}, // 수량
                {text: formatCurrency(item['totalRawMatAmount']), alignment: 'right', style: 'tableText'}, // 재료비
                {text: formatCurrency(item['totalManufactureAmount']), alignment: 'right', style: 'tableText'}, // 가공비
                {text: formatCurrency(item['vatAmount']), alignment: 'right', style: 'tableText'}, // 세액
                {text: formatCurrency(item['deliveryCharge']), alignment: 'right', style: 'tableText'}, // 운임비
                {text: amount.toLocaleString(), alignment: 'right'}, // 금액
              ]
            }),
            [{text: ' '}, '','', '','', '','', '','', '',],
            [{text: ' '}, '','', '','', '','', '','', '',],
            [
              {text: '합계'},
              {text: ''},
              {text: ''},
              {text: ''},
              {text: ''},
              {text: formatCurrency(dailySalesData.amount.totalRawMatAmount), alignment: 'right', style: 'tableText'},
              {
                text: formatCurrency(dailySalesData.amount.totalManufactureAmount),
                alignment: 'right',
                style: 'tableText'
              },
              {text: formatCurrency(dailySalesData.amount.totalVatAmount), alignment: 'right', style: 'tableText'},
              {text: formatCurrency(dailySalesData.amount.totalDeliveryCharge), alignment: 'right', style: 'tableText'},
              {text: totalAmount.toLocaleString(), alignment: 'right', style: 'tableText'},
            ]
          ],
        },
        layout: {
          ...basicTableLayout,
          paddingBottom: () => 6,
          paddingTop: () => 6
        },
        margin: [0, 0, 0, 0]
      },
    ],
    defaultStyle: {
      font: 'Pretendard',
      fontSize: 8.5,
    },
    styles: {
      header: {fontSize: 14,},
      subheader: {fontSize: 10, marginBottom: 20},
    }
  }
  return docDef;
}


/**
 * 거래처별 매출현황
 */
export const companySalesDocDef = (companySalesData) => {
  // console.log('printData: ', companySalesData);

  // amount 가 재료비 + 가공비 (단가X)
  const totalRawMatAmount = companySalesData.data?.reduce(
    (acc, cur) => acc + (Number(cur.rawMatAmount) || 0),
    0
  );
  const totalManuAmount = companySalesData.data?.reduce(
    (acc, cur) => acc + (Number(cur.manufactureAmount) || 0),
    0
  );
  const totalVatAmount = companySalesData.data?.reduce(
    (acc, cur) => acc + (Number(cur.vatAmount) || 0),
    0
  );
  const totalDeliveryCharge = companySalesData.data?.reduce(
    (acc, cur) => acc + (Number(cur.deliveryCharge) || 0),
    0
  );
  let totalPayingAmount = 0;
/*
  const totalAmount = companySalesData.data?.reduce(
    (acc, cur) => acc + (Number(cur.amount) || 0),
    0
  );
*/

  const today = new Date();
  const docDef: TDocumentDefinitions = {
 /*   pageSize: {
      width: A4_W * PAGE_SCALE,
      height: A4_H * PAGE_SCALE,
    },*/
    pageMargins: [24, 20, 24, 10],
    header: (currentPage, pageCount) => ({
      columns: [
        {text: `Page ${currentPage} / ${pageCount}`, alignment: 'right'},
      ],
      margin: [5, 10, 5, 0], // 좌우 여백 조정
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
          widths: ['auto', 90, 30, 55, 55, 45, 45, 55, 53, 55],
          body: [
            ['날짜', '품명/규격', '수량', '재료비', '가공비','세액', '운임비', '금액', '수금액', '잔액'].map(header => ({
              text: header,
              alignment: 'center'
            })),
            [
              {text: '', style: 'tableText'}, // 날짜
              {text: '전일이월', style: 'tableText'}, // 품명+규격
              // {text: '', style: 'tableText'}, // 규격
              {text: '', alignment: 'right', style: 'tableText'}, // 수량
              {text: '', alignment: 'right', style: 'tableText'}, // 재료비
              {text: '', alignment: 'right', style: 'tableText'}, // 가공비
              {text: '', alignment: 'right', style: 'tableText'}, // 세액
              {text: '', alignment: 'right', style: 'tableText'}, // 운임비
              {text: '', alignment: 'right', style: 'tableText'}, // 금액
              {text: '', alignment: 'right', style: 'tableText'}, // 수금액
              {text: companySalesData.outstandingBeforeOneDay?.toLocaleString(), alignment: 'right'}, // 잔액
            ],
            ...companySalesData.data.map((item) => {
              let payingAmount, rawMatAmount, manufactureAmount, amount, quantity = '';
              if (item.productName === '입금액') {
                payingAmount = -item.amount;
                totalPayingAmount += payingAmount;
              } else {
                quantity = item.quantity;
                rawMatAmount = item.rawMatAmount;
                manufactureAmount = item.manufactureAmount;
                amount = rawMatAmount + manufactureAmount + Number(item.vatAmount) + Number(item.deliveryCharge);
              }
              const createdAt: string = item.createdAt?.split('T')[0] || '';

              return [
                {text: createdAt, style: 'tableText'}, // 날짜
                {text: `${item['productName']} ${item['scale']}`, style: 'tableText'}, // 품명+규격
                {text: quantity, alignment: 'right', style: 'tableText'}, // 수량
                {text: formatCurrency(item['rawMatAmount']), alignment: 'right', style: 'tableText'}, // 재료비
                {text: formatCurrency(item['manufactureAmount']), alignment: 'right', style: 'tableText'}, // 가공비
                {text: formatCurrency(item.vatAmount), alignment: 'right', style: 'tableText'}, // 세액
                {text: formatCurrency(item.deliveryCharge), alignment: 'right', style: 'tableText'}, // 운임비
                {text: amount?.toLocaleString(), alignment: 'right', style: 'tableText'}, // 금액
                {text: payingAmount?.toLocaleString(), alignment: 'right', style: 'tableText'}, // 수금액
                {text: item['remainingAmount'].toLocaleString(), alignment: 'right'}, // 잔액
              ]
            }),
            [{text: ' '}, '','', '','', '','', '','', '',],
            [{text: ' '}, '','', '','', '','', '','', '',],
            [
              { text: '합계', alignment: 'center', style: 'tableText' },
              {}, {},
              { text: totalRawMatAmount.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: totalManuAmount.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: totalVatAmount.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: totalDeliveryCharge.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: (totalRawMatAmount + totalManuAmount + totalVatAmount + totalDeliveryCharge).toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: totalPayingAmount.toLocaleString(), alignment: 'right', style: 'tableText' }, // 수금액계
              { text: '', style: 'tableText' },
            ],
          ],
        },
        layout: {
          ...basicTableLayout,
          paddingBottom: () => 6,
          paddingTop: () => 6,
        },
        margin: [0, 0, 0, 0]
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
 * 월별매입조회
 */
export const purchaseReceiptDocRef = (data): TDocumentDefinitions => {
  // 합계 계산
  const totalPurchaseAmount = data.records.reduce(
    (acc, cur) => acc + (Number(cur.totalSalesAmount) || 0),
    0
  );
  const totalVatAmount = data.records.reduce(
    (acc, cur) => acc + (Number(cur.totalVatPrice) || 0),
    0
  );
  const totalPayingAmount = data.records.reduce(
    (acc, cur) => acc + (Number(cur.productPrice) || 0),
    0
  )
  const totalSum = data.records.reduce(
    (acc, cur) => acc + (Number(cur.totalPrice) || 0),
    0
  );

  // debug
  // console.log(data);

  const bankData = data.bankArr?.map((b) => `${b.bankName} : ${b.accountNumber}`).join(' ');
  return {
    pageSize: {
      width: A4_W * PAGE_SCALE,
      height: A4_H * PAGE_SCALE,
    },
    pageMargins: [15, 20, 24, 20], // 좌 25, 상 20, 우 25, 하 20
    content: [
      {
        text: `${data.companyName}`,
        style: 'header',
        alignment: 'center',
        marginBottom: 5,
      },
      {
        text: `T ${data.telNumber}${headerSpacing} F ${data.subTelNumber}${headerSpacing}  HP ${data.phoneNumber}${headerSpacing}  ${bankData}`,
        style: {
          fontSize: 8,
        },
        marginBottom: 5,
        alignment: 'center'
      },
      {
        table: {
          headerRows: 1,
          widths: ['auto', '20%', 20, 45, 50, 62, 55, 62, 55, 62],
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
                alignment: 'center'
              }, // 수량
              {
                text: item.unitPrice ? Number(item.unitPrice).toLocaleString() : '',
                style: 'tableText',
                alignment: 'center'
              }, // 단가
              {
                text: item.totalSalesAmount ? Number(item.totalSalesAmount).toLocaleString() : '',
                style: 'tableText',
                alignment: 'center'
              }, // 매입금액
              {
                text: item.totalVatPrice ? Number(item.totalVatPrice).toLocaleString() : '',
                style: 'tableText',
                alignment: 'center'
              }, // 매입세액
              {
                text: item.totalPrice ? Number(item.totalPrice).toLocaleString() : '',
                style: 'tableText',
                alignment: 'center'
              }, // 합계
              {
                text: item.productPrice ? Number(item.productPrice).toLocaleString() : '',
                style: 'tableText',
                alignment: 'center'
              }, // 입금
              {text: Number(item.payableBalance).toLocaleString(), style: 'tableText', alignment: 'right'}, // 잔액
            ]),
            [
              { text: '합계', alignment: 'center', style: 'tableText' },
              {}, {}, {}, {},
              { text: totalPurchaseAmount.toLocaleString(), alignment: 'center', style: 'tableText' },
              { text: totalVatAmount.toLocaleString(), alignment: 'center', style: 'tableText' },
              { text: totalSum.toLocaleString(), alignment: 'center', style: 'tableText' },
              { text: totalPayingAmount.toLocaleString(), alignment: 'center', style: 'tableText' },
              { text: '', style: 'tableText' },
            ],
          ],
        },
        layout: {
          ...basicTableLayout,
          paddingBottom: () => 10,
          paddingTop: () => 10,
        },
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
  }
}

/**
 * 매출처 리스트
 */
export const companyListDocRef = (data): TDocumentDefinitions => {
  const today = new Date();
  return {
    pageOrientation: 'landscape', // 🔥 페이지를 가로로 설정
    pageSize: {
      width: A4_W * PAGE_SCALE,
      height: A4_H * PAGE_SCALE,
    },
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
    pageSize: {
      width: A4_W * PAGE_SCALE,
      height: A4_H * PAGE_SCALE,
    },
    pageMargins: [24, 20, 24, 10],
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
          widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
          body: [
            ['거래처명', '재료비', '가공비', '세액', '운임비', '총액', '입금액', '잔액'].map(header => ({
              text: header,
              alignment: 'center',
            })),
            ...companySalesSumData.data.map((item: any) => [
              {text: item['company-name'], style: 'tableText'}, // 품명 (거래처명)
              {text: Number(item['material-price']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 재료비
              {text: Number(item['processing-price']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 가공비
              {text: Number(item['vat-price']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 가공비
              {text: Number(item['delivery-charge']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 가공비
              {text: Number(item['total-amount']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 수금액
              {text: Number(item['paying-amount']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 총 금액
              {text: Number(item['remaining-amount']).toLocaleString(), style: 'tableText', alignment: 'right'}, // 잔액
            ]),
            [{text: ' '}, '' , '', '' , '', '' , '', ''],
            [{text: ' '}, '' , '', '' , '', '' , '', ''],
            [
              {text: '합계 '},
              {text: companySalesSumData.footerData.sumRaw?.toLocaleString(), style: 'tableText', alignment: 'right'},
              {text: companySalesSumData.footerData.sumManu?.toLocaleString(), style: 'tableText', alignment: 'right'},
              {text: companySalesSumData.footerData.sumVat?.toLocaleString(), style: 'tableText', alignment: 'right'},
              {text: companySalesSumData.footerData.sumDelivery?.toLocaleString(), style: 'tableText', alignment: 'right'},
              {text: companySalesSumData.footerData.sumSales?.toLocaleString(), style: 'tableText', alignment: 'right'},
              {text: companySalesSumData.footerData.sumPaying?.toLocaleString(), style: 'tableText', alignment: 'right'},
              {text: companySalesSumData.footerData.sumRemaining?.toLocaleString(), style: 'tableText', alignment: 'right'},
            ]
          ],
        },
        layout: {
          ...basicTableLayout,
          paddingBottom: () => 6,
          paddingTop: () => 6,
        },
        margin: [0, 0, 0, 0]
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
  // console.log(itemSalesSumData);
  /* {
  data: [
    {
      receiptId: 'c2e9c2b8-1867-44b4-ab58-e04d45792ec1',
      companyName: '(ㄱ)',
      productName: '0',
      vCutAmount: '0',
      rawMatAmount: '2090',
      manufactureAmount: '1000',
      quantity: 2,
      productLength: '0',
      scale: '2x2',
      vCut: '0',
      vatAmount: '600',
      deliveryCharge: '0',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '2000',
      totalRawMatAmount: '4180',
      totalSalesAmount: '7380',
      totalDeliveryCharge: '0',
      totalVatAmount: '1200'
    },
    {
      receiptId: 'c2e9c2b8-1867-44b4-ab58-e04d45792ec1',
      companyName: '(ㄱ)',
      productName: '000',
      vCutAmount: '0',
      rawMatAmount: '3000',
      manufactureAmount: '5000',
      quantity: 1,
      productLength: '0',
      scale: '11',
      vCut: '0',
      vatAmount: '0',
      deliveryCharge: '0',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '5000',
      totalRawMatAmount: '3000',
      totalSalesAmount: '8000',
      totalDeliveryCharge: '0',
      totalVatAmount: '0'
    },
    {
      receiptId: '76044338-7f58-4594-a4da-50504374fbdc',
      companyName: '(ㄱ)',
      productName: '00',
      vCutAmount: '0',
      rawMatAmount: '3000',
      manufactureAmount: '14000',
      quantity: 0,
      productLength: '0',
      scale: '2x2',
      vCut: '0',
      vatAmount: '0',
      deliveryCharge: '0',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '0',
      totalRawMatAmount: '0',
      totalSalesAmount: '0',
      totalDeliveryCharge: '0',
      totalVatAmount: '0'
    },
    {
      receiptId: 'ac66ce9c-ee7a-4541-893f-6330b141aae9',
      companyName: '(ㄱ)',
      productName: '02',
      vCutAmount: '0',
      rawMatAmount: '1020',
      manufactureAmount: '1800',
      quantity: 6.833,
      productLength: '0',
      scale: '3x3',
      vCut: '0',
      vatAmount: '0',
      deliveryCharge: '0',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '12299',
      totalRawMatAmount: '6970',
      totalSalesAmount: '32769',
      totalDeliveryCharge: '13500',
      totalVatAmount: '0'
    },
    {
      receiptId: '5b26895b-ae90-406f-b750-5b5c56416392',
      companyName: '후인건축',
      productName: '00',
      vCutAmount: '0',
      rawMatAmount: '2000',
      manufactureAmount: '9000',
      quantity: 68,
      productLength: '0',
      scale: '11x1',
      vCut: '0',
      vatAmount: '1000',
      deliveryCharge: '0',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '612000',
      totalRawMatAmount: '136000',
      totalSalesAmount: '768000',
      totalDeliveryCharge: '0',
      totalVatAmount: '20000'
    },
    {
      receiptId: '1aba9d4c-6c79-4619-a533-4b63b702095e',
      companyName: '(ㄱ)',
      productName: '0',
      vCutAmount: '0',
      rawMatAmount: '3000',
      manufactureAmount: '4000',
      quantity: 2,
      productLength: '0',
      scale: '1x1',
      vCut: '0',
      vatAmount: '0',
      deliveryCharge: '0',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '8000',
      totalRawMatAmount: '6000',
      totalSalesAmount: '14000',
      totalDeliveryCharge: '0',
      totalVatAmount: '0'
    },
    {
      receiptId: '1aba9d4c-6c79-4619-a533-4b63b702095e',
      companyName: '(ㄱ)',
      productName: '01',
      vCutAmount: '0',
      rawMatAmount: '4000',
      manufactureAmount: '5000',
      quantity: 2,
      productLength: '0',
      scale: '',
      vCut: '0',
      vatAmount: '0',
      deliveryCharge: '0',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '10000',
      totalRawMatAmount: '8000',
      totalSalesAmount: '18000',
      totalDeliveryCharge: '0',
      totalVatAmount: '0'
    },
    {
      receiptId: '1aba9d4c-6c79-4619-a533-4b63b702095e',
      companyName: '(ㄱ)',
      productName: '하장스탓AB',
      vCutAmount: '0',
      rawMatAmount: '2020',
      manufactureAmount: '0',
      quantity: 3,
      productLength: '0',
      scale: 'EGI1.55TX4X4000',
      vCut: '0',
      vatAmount: '0',
      deliveryCharge: '2000',
      createdAt: '2025-10-01T00:00:00.000Z',
      totalManufactureAmount: '0',
      totalRawMatAmount: '6060',
      totalSalesAmount: '12060',
      totalDeliveryCharge: '6000',
      totalVatAmount: '0'
    }
  ],
  startAt: '2025-10-01',
  endAt: '2025-10-01'
}  * */
  const today = new Date();
  const docDef: TDocumentDefinitions = {
    pageSize: {
      width: A4_W * PAGE_SCALE,
      height: A4_H * PAGE_SCALE,
    },
    pageMargins: [24, 20, 24, 10],
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
          widths: ['*', '*', 'auto', 40, 50, 40, 50, 40, 40, 50],
          body: [
            ['품명', '규격', '수량', '재료단가', '재료비', '가공단가', '가공비', '세액', '운임비', '금액'].map(header => ({
              text: header,
              alignment: 'center',
            })),
            ...itemSalesSumData.data.map((item) => [
              {text: item['productName'], style: 'tableText'}, // 품명
              {text: item['scale'], style: 'tableText'}, // 규격
              {text: formatDecimal(item['quantity']), style: 'tableText', alignment: 'right'}, // 수량
              {text: formatCurrency(item['rawMatAmount']), style: 'tableText', alignment: 'right'}, // 재료 단가
              {text: formatCurrency(item['totalRawMatAmount']), style: 'tableText', alignment: 'right'}, // 재료비
              {text: formatCurrency(item['manufactureAmount']), style: 'tableText', alignment: 'right'}, // 가공 단가
              {text: formatCurrency(item['totalManufactureAmount']), style: 'tableText', alignment: 'right'}, // 가공비
              {text: formatCurrency(item['totalVatAmount']), style: 'tableText', alignment: 'right'}, // 가공비
              {text: formatCurrency(item['totalDeliveryCharge']), style: 'tableText', alignment: 'right'}, // 가공비
              {text: formatCurrency(item['totalSalesAmount']), style: 'tableText', alignment: 'right'}, // 금액
            ]),
            [
              { text: '합계', alignment: 'center', style: 'tableText' },
              {}, {}, {},
              { text: itemSalesSumData.rawSum?.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: '', style: 'tableText' },
              { text: itemSalesSumData.manuSum?.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: itemSalesSumData.vatSum?.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: itemSalesSumData.delSum?.toLocaleString(), alignment: 'right', style: 'tableText' },
              { text: itemSalesSumData.sum?.toLocaleString(), alignment: 'right', style: 'tableText' },
            ]
          ],
        },
        layout: {
          hLineWidth: () => 0.4,
          vLineWidth: () => 0.4,
        },
        margin: [0, 0, 0, 0],
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
    pageSize: {
      width: A4_W * PAGE_SCALE,
      height: A4_H * PAGE_SCALE,
    },
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
  * {
  locationName: [],
  companyName: '(구,동성)경영산업',
  payingAmount: '0',
  carryoverAmount: '11503730',
  totalSalesAmount: '22000',
  createdAt: '2025-10-16',
  sales: [
    {
      receiptId: '86d47d1a-9eef-44c1-8c0d-f9c36bb31b12',
      companyName: '(구,동성)경영산업',
      productName: '2B',
      vCutAmount: '0',
      rawMatAmount: '1000',
      manufactureAmount: '1000',
      quantity: 10,
      productLength: '0',
      scale: '0.3TX1X2',
      vCut: '0',
      vatAmount: '1000',
      deliveryCharge: '1000',
      createdAt: '2025-10-16T00:00:00.000Z',
      locationNames: []
    }
  ]
}
{
  locationName: [],
  companyName: '(구,동성)경영산업',
  payingAmount: '0',
  carryoverAmount: '11503730',
  totalSalesAmount: '22000',
  createdAt: '2025-10-16',
  sales: [
    {
      receiptId: '86d47d1a-9eef-44c1-8c0d-f9c36bb31b12',
      companyName: '(구,동성)경영산업',
      productName: '2B',
      vCutAmount: '0',
      rawMatAmount: '1000',
      manufactureAmount: '1000',
      quantity: 10,
      productLength: '0',
      scale: '0.3TX1X2',
      vCut: '0',
      vatAmount: '1000',
      deliveryCharge: '1000',
      createdAt: '2025-10-16T00:00:00.000Z',
      locationNames: []
    }
  ]
}
[25649:1016/223155.283299:ERROR:CONSOLE(1)] "Request Autofill.enable failed. {"code":-32601,"message":"'Autofill.enable' wasn't found"}", source: devtools://devtools/bundled/core/protocol_client/protocol_client.js (1)
10:32:58 PM [vite] hmr update /src/pages/revenue-manage/RevenueMain.tsx
{
  locationName: [],
  companyName: '(구,동성)경영산업',
  payingAmount: '0',
  carryoverAmount: '11503730',
  totalSalesAmount: '22000',
  createdAt: '2025-10-16',
  sales: [
    {
      receiptId: '86d47d1a-9eef-44c1-8c0d-f9c36bb31b12',
      companyName: '(구,동성)경영산업',
      productName: '2B',
      vCutAmount: '0',
      rawMatAmount: '1000',
      manufactureAmount: '1000',
      quantity: 10,
      productLength: '0',
      scale: '0.3TX1X2',
      vCut: '0',
      vatAmount: '1000',
      deliveryCharge: '1000',
      createdAt: '2025-10-16T00:00:00.000Z',
      locationNames: []
    }
  ]
}
{
  locationName: [],
  companyName: '(구,동성)경영산업',
  payingAmount: '0',
  carryoverAmount: '11503730',
  totalSalesAmount: '22000',
  createdAt: '2025-10-16',
  sales: [
    {
      receiptId: '86d47d1a-9eef-44c1-8c0d-f9c36bb31b12',
      companyName: '(구,동성)경영산업',
      productName: '2B',
      vCutAmount: '0',
      rawMatAmount: '1000',
      manufactureAmount: '1000',
      quantity: 10,
      productLength: '0',
      scale: '0.3TX1X2',
      vCut: '0',
      vatAmount: '1000',
      deliveryCharge: '1000',
      createdAt: '2025-10-16T00:00:00.000Z',
      locationNames: []
    }
  ]
}
*/
  // console.log(data);
  const text = index === 0 ? '(공급자보관용)' : '(공급받는자보관용)'
  const totalRowsNum = data.sales.length > 13 ? 25 : 13;
  const shouldPageBreak = index === 1 && totalRowsNum === 25;

  // 합계 계산
  const sum = data.sales.map((item) =>
    Math.round(Number(item.rawMatAmount) * item.quantity)
    + Math.trunc(Number(item.manufactureAmount) * item.quantity)
    + Number(item.deliveryCharge)
    + Number(item.vatAmount)
  )
  // const totalDeliveryCharge = data.sales.reduce((acc, cur) => acc + Number(cur.deliveryCharge || 0), 0);
  // const totalVatAmount= data.sales.reduce((acc, cur) => acc + Number(cur.vatAmount || 0), 0);

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
            text: `거${headerSpacing}래${headerSpacing}명${headerSpacing}세${headerSpacing}서`,
            fontSize: 15,
            colSpan: 6,
            margin: [70, 0, 0, 0],
            alignment: 'center',
            border: [true, true, false, true]
          }, '', '', '', '', '',
            {text: `${text}`, alignment: 'right', border: [false, true, true, true]}
          ],
          [
            {
              stack: [
                { text: data.createdAt, fontSize: 10 }, {text: "\n"},
                { text: data.companyName + '      귀하', margin: [10, 0, 0, 0], fontSize: 11}, {text: "\n"},
                { text: '아래와 같이 계산합니다.', margin: [10, 0, 0, 0], fontSize: 8 },
              ],
              rowSpan: 4,
              colSpan: 2,
              margin: [10, 0, 0, 0]
            }, '',
            {text: '공        급        자', colSpan: 5, alignment: 'center'}, '', '', '', ''
          ],
          ['', '', {text: '등 록 번 호', alignment: 'center', noWrap: true},
            {text: '122 - 86 - 29029', colSpan: 4, alignment: 'center'}, '', '', ''
          ],
          ['', '',
            {text: '상 호', alignment: 'center'},
            {text: '대한금속이엔지(주)', colSpan: 2, alignment: 'center'}, '',
            {text: '성 명', alignment: 'center'},
            {text: '박신석', alignment: 'center'}
          ],
          ['', '',
            {text: '사 업 장 주 소', alignment: 'center', noWrap: true},
            {text: '인천 계양구 평리길 92(평동 85-3)', colSpan: 4, alignment: 'center'}, '', '', ''
          ],
          [
            // {text: `현장명 : ${firstRowNames?.join(', ')}`, colSpan: 2, rowSpan: 2, border: [true, true, true, true]}, '',
            {text: `${firstRowNames?.join(', ')}`, colSpan: 2, rowSpan: 2, border: [true, true, true, true], alignment: 'center'}, '',
            {text: '업 태', alignment: 'center', noWrap: true},
            {text: '제조업', alignment: 'center'},
            {text: '종 목', alignment: 'center', noWrap: true},
            {text: '일반철물제작', colSpan: 2, alignment: 'center'}, ''
          ],
          [{text: `${secondRowNames?.join(', ')}`, colSpan: 2, border: [true, false, true, true]}, '',
            {text: '전 화', alignment: 'center'},
            {text: '032-543-2756,7', alignment: 'center'},
            {text: '팩 스', alignment: 'center', noWrap: true},
            {text: '032-543-2763', colSpan: 2, alignment: 'center'}, ''
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.4,
        vLineWidth: () => 0.4,
      },
      ...(shouldPageBreak ? {pageBreak: 'before'} : {}),
    },
    {
      table: {
        widths: [80, 120, 50, '*', '*', '*'],
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
            {text: `${item.productName}`, alignment: 'center', padding: [0, 0, 0, 0],   noWrap: false,},
            {text: `${item.productScale || item.scale}`, alignment: 'center', padding: [0, 0, 0, 0], noWrap: false},
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
              {text: `전미수:`, width: 'auto'},
              {text: `${formatCurrency(data.carryoverAmount)}`, width: '*', alignment: 'center'},
              {text: `매출계:`, width: 'auto'},
              {text: `${formatCurrency(data.totalSalesAmount)}`, width: '*', alignment: 'center'},
              {text: `입금액:`, width: 'auto'},
              {text: `${formatCurrency(data.payingAmount)}`, width: '*', alignment: 'center'},
              {text: `미수계:`, width: 'auto'},
              {text: `${(Number(data.carryoverAmount) + Number(data.totalSalesAmount) - Number(data.payingAmount)).toLocaleString()}`, width: '*', alignment: 'center'},
            ],
            colSpan: 6,
          }, '', '', '', '', ''],
          [{text: '', border: [true, true, false, true], colSpan: 4}, '', '', '',
            {text: '인수자 : ', border: [false, true, false, true]},
            {text: '(인)', border: [false, true, true, true]},
          ]
        ],
      },
      layout: {
        hLineWidth: () => 0.4,
        vLineWidth: () => 0.4,
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
  const totalRowsNum = data.sales?.length > 13 ? 25 : 13;

  const docDef: TDocumentDefinitions = {
    pageMargins: [30, 43, 30, 20],
    pageSize: 'A4',
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
            margin: [0, 12, 0, 20]
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
      fontSize: 9.5,
    },
  };
  return docDef;
};

/**
 * payment 생성
 */
const createPayrollRegisterContent = (payrollRegisterData: Payroll): any[] => {
  // eslint-disable-next-line no-unsafe-optional-chaining
  const [year, month, day]: string[] = (payrollRegisterData.createdAt).split('T')[0]?.split("-");
  const payments = payrollRegisterData.payments
  const widths = Array.from({length: payments.length + 1}, () => '*')
  // const spacer = Array.from({length: widths.length}, () => ({text: ''}))
  widths[0] = '15%'
  // console.log(payrollRegisterData);
  const headers: any[][] = [
    [{text: `작성일자: ${year}-${month}-${day}`, style: 'subheader', border: [false, false, false, false]}],
  ]
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
    const salary = Math.ceil(Number(payment.salary) / 10) * 10;
    const totalSalary = Math.ceil((salary - Number(payment.deduction)) / 10) * 10;
    headers[0].push({text: `${payment.memo || ""}\n${payment.employeePosition}`, style: 'cell', alignment: 'center', margin: [0, 6, 0, 1], border: [false, false, false, false]})
    employees.push({text: payment.employeeName, style: 'cell', alignment: 'center'})

    salaryDetails['기본급'].push({
      text: `${formatCurrency(payment.paymentDetail.pay)}`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['시급'].push({
      text: `${formatCurrency(payment.paymentDetail.hourlyWage)}`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['연장 근무시간'].push({
      text: `${payment.paymentDetail.extendWorkingTime}`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['연장수당'].push({
      text: `${formatCurrency(payment.paymentDetail.extendWokringWage)}`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['휴일 근무시간'].push({
      text: `${payment.paymentDetail.dayOffWorkingTime}`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['휴일 근무수당'].push({
      text: `${formatCurrency(payment.paymentDetail.dayOffWorkingWage)}`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['연차수당'].push({
      text: `${formatCurrency(payment.paymentDetail.annualLeaveAllowance)}`,
      style: 'cell',
      alignment: 'center'
    })
    salaryDetails['식대'].push({
      text: `${formatCurrency(payment.paymentDetail.mealAllowance)}`,
      style: 'cell',
      alignment: 'center'
    })
    deductions.push({
      text: `${formatCurrency(payment.deduction)}`,
      style: 'cell',
      alignment: 'center'
    })
    salarys.push({
      text: `${salary.toLocaleString()}`,
      style: 'cell',
      alignment: 'center',
    })
    totalSalarys.push({
      text: `${totalSalary.toLocaleString()}`,
      style: 'cell',
      alignment: 'center',
    })

    for (let j = 0; j < payment.deductionDetail.length; ++j) {
      deductionDetails[payment.deductionDetail[j]['purpose']].push({
        text: `${formatCurrency(payment.deductionDetail[j]['value'])}`,
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
          employees,
          // spacer,
          ...Object.keys(salaryDetails).map((key) => salaryDetails[key]),
          salarys,
          // spacer,
          ...Object.keys(deductionDetails).map((key) => deductionDetails[key]),
          deductions,
          // spacer,
          totalSalarys,
          // spacer,
        ],
      },
      layout: payrollLayout,
      margin: [0, 0, 0, 10],
    },
  ]
}

/** 급여대장 layout */
const payrollLayout = {
  hLineWidth: function (i: number, node: any) {
    // i는 현재 그려지는 horizontal line의 index (row 사이사이)
    // node.table.body.length = 전체 row 개수
    const rowCount = node.table.body.length;

    // 수령액계 row index
    const salaryRowIndex = 10;
    // 실수령액 row index
    const totalSalaryRowIndex = rowCount - 1;

    // 수령액계 row 아래줄, 실수령액 row 위/아래줄은 두껍게
    if (i === salaryRowIndex
      || i === salaryRowIndex + 1
      || i === totalSalaryRowIndex
      || i === totalSalaryRowIndex + 1
    ) {
      return 1.5; // 두께 2
    }
    return 0.4; // 기본 두께 0.4
  },
  vLineWidth: function () {
    return 0.4; // 세로줄은 기본 두께
  },
  hLineColor: function () {
    return 'black';
  },
  vLineColor: function () {
    return 'black';
  },
};

/**
 * ledger 생성
 */
const createFinancialLedgerContent = (financialLedgerData: Ledger): any[] => {
  const items = financialLedgerData.payingExpenses || [];
  const memo = financialLedgerData?.deductionExpenses[0]?.memo || "";
  const LEFT_ROWS = 15;
  const TABLE_WIDTHS: (string | number)[] = [
    '15%', '13%', '11%', '11%',
    '15%', '13%', '11%', '11%',
  ];

  // 좌/우 리스트로 분리
  const leftList = items.slice(0, LEFT_ROWS);
  const rightList = items.slice(LEFT_ROWS);

  // 표 헤더: 8열(4열*2세트)
  const headerRow = [
    {text: '항목', style: 'subheader', alignment: 'center'},
    {text: '금액', style: 'subheader', alignment: 'center'},
    {text: '지출일', style: 'subheader', alignment: 'center'},
    {text: '메모', style: 'subheader', alignment: 'center'},
    {text: '항목', style: 'subheader', alignment: 'center'},
    {text: '금액', style: 'subheader', alignment: 'center'},
    {text: '지출일', style: 'subheader', alignment: 'center'},
    {text: '메모', style: 'subheader', alignment: 'center'},
  ];

  // 2개 항목씩 한 행으로(좌 4열 + 우 4열)
  const bodyRows: any[][] = [headerRow];
  const maxRows = Math.max(leftList.length, rightList.length);

  const fmtItem = (it?: any) => {
    if (!it) {
      return [
        {text: '', style: 'cell', noWrap: true},
        {text: '', style: 'cell', alignment: 'right'},
        {text: '', style: 'cell', alignment: 'center'},
        {text: '', style: 'cell'},
      ];
    }
    const purpose = it.purpose ?? it.name ?? '';
    const valueRaw = it.value ?? it.amount;
    const valueTxt =
      valueRaw != null && valueRaw !== ''
        ? `${formatCurrency(String(valueRaw))}`
        : '';
    const group = it.group ?? it.groupName ?? '';
    const memo = it.memo ?? it.note ?? '';
    return [
      {text: purpose, style: 'cell', noWrap: true},
      {text: valueTxt, style: 'cell', alignment: 'right'},
      {text: group, style: 'cell', alignment: 'center'},
      {text: memo, style: 'cell', alignment: 'center'},
    ];
  };

  for (let r = 0; r < maxRows; r++) {
    bodyRows.push([
      ...fmtItem(leftList[r]),
      ...fmtItem(rightList[r]),
    ]);
  }

  const groups = Object.keys(financialLedgerData.calcGroups)
  const groupCalcs = [[], []]
  for (let i = 0; i < groups.length; ++i) {
    const group = groups[i]
    groupCalcs[0].push({text: group.length === 0 ? '그 외' : group, style: 'subheader'})
    groupCalcs[1].push({
      text: `${formatCurrency(String(financialLedgerData.calcGroups[group]))}`,
      style: 'cell',
      alignment: 'center'
    })
  }

  return [
    {
      text: `지출내역`,
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 10],
      fontSize: 12,
    },
    {text: memo, fontSize: 8,},
    {
      table: {
        widths: TABLE_WIDTHS,
        body: bodyRows,
      },
      layout: {
        hLineWidth: () => 0.4,
        vLineWidth: () => 0.4
      },
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        widths: ["*", "*", "*", "*", "*", "*", "*", "*"],
        body: groupCalcs,
      },
      layout: {
        hLineWidth: () => 0.4,
        vLineWidth: () => 0.4
      },
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
  console.log(data);
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
const getSalaryContent = (data: Payment, date: Date): any[] => {
  const printDate = new Date(date ?? new Date());
  console.log(printDate)
  const today = formatDate(printDate);
  printDate.setMonth(printDate.getMonth() - 1);
  const paymentRows = [
    ['기본급', formatCurrency(data.paymentDetail.pay)],
    ['시급', formatCurrency(data.paymentDetail.hourlyWage)],
    ['연장 근무시간', `${data.paymentDetail.extendWorkingTime}`],
    ['연장 근무수당', `${formatCurrency(data.paymentDetail.extendWokringWage)}`],
    ['휴일 근무시간', `${data.paymentDetail.dayOffWorkingTime}`],
    ['휴일 근무수당', `${formatCurrency(data.paymentDetail.dayOffWorkingWage)}`],
    ['연차수당 (연차+월차)', `${formatCurrency(data.paymentDetail.annualLeaveAllowance)}`],
  ];
  const deductionRows = data.deductionDetail.map(d => [
    d.purpose,
    formatCurrency(d.value),
  ]);
  const rowCount = Math.max(paymentRows.length, deductionRows.length);

  const mergedRows = Array.from({ length: rowCount }).map((_, i) => {
    const pay = paymentRows[i] || ['', ''];
    const ded = deductionRows[i] || ['', ''];

    return [
      { text: pay[0], alignment: 'center', margin: [0, 5, 0, 0]},
      { text: pay[1], alignment: 'right' , margin: [0, 5, 0, 0]},
      { text: ded[0], alignment: 'center', margin: [0, 5, 0, 0] },
      { text: ded[1], alignment: 'right' , margin: [0, 5, 0, 0]},
    ];
  });
  const salary = Math.ceil(Number(data.salary) / 10) * 10;
  const totalSalary = Math.ceil((salary - Number(data.deduction)) / 10) * 10;
  console.log(data);
  // debug
  // console.log(deductions)

  // content만 반환
  return [
    {
      text: `대한금속ENG(주) ${printDate.getFullYear()}년 ${printDate.getMonth() + 1}월 급여명세서 ${today}`,
      style: 'header',
      alignment: 'center',
      margin: [0, 0, 0, 10],
    },
    {
      columns: [
        {width: "20%", text: `${data.employeeName} 님`, style: 'subheader', fontSize: 12},
        {
          width: "60%",
          text: `사번: ${data?.startWorkingAt?.split('T')[0] || ''}`,
          alignment: 'right',
          style: 'subheader'
        },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        widths: ['20%', '30%', '20%', '30%'],
        heights: 24,
        body: [
          ...mergedRows,
        ]
      },
      layout: {
        hLineWidth: () => 0.4,
        vLineWidth: () => 0.4,
      },
      margin: [0, 0, 0, 10],
    },
    {text: "\n"},
    {text: '※ 근로계약서 참조'},
    {text: "\n"},
    {text: `연장수당: ${formatCurrency(data.paymentDetail.hourlyWage)} X ${data.paymentDetail.extendWorkingTime} X ${data.paymentDetail.multis.extendWorkingMulti}`},
    {text: "\n"},
    {text: `휴일수당: ${formatCurrency(data.paymentDetail.hourlyWage)} X ${data.paymentDetail.dayOffWorkingTime} X ${data.paymentDetail.multis.dayOffWorkingMulti}`},
    {text: "\n"},
    {text: `연차수당(연차+월차): ${formatCurrency(data.paymentDetail.hourlyWage)} X 8 X ${data.paymentDetail.multis.annualLeaveAllowanceMulti}`},
    {text: "\n"},
    {
      table: {
        widths: ['*', '*', '*'],
        heights: 24,
        body: [
          [
            {text: '수령액계', alignment: 'center', margin: [0, 5, 0, 0]},
            {text: '공제액계', alignment: 'center', margin: [0, 5, 0, 0]},
            {text: '실수령액', alignment: 'center', margin: [0, 5, 0, 0]},
          ],
          [
            {text: `${salary.toLocaleString()} 원`, alignment: 'right', margin: [0, 5, 0, 0]},
            {text: `${formatCurrency(data.deduction)} 원`, alignment: 'right', margin: [0, 5, 0, 0]},
            {text: `${totalSalary.toLocaleString()} 원`, alignment: 'right', margin: [0, 5, 0, 0]},
          ],
        ]
      },
      layout: {
        hLineWidth: () => 0.4,
        vLineWidth: () => 0.4
      },
      margin: [0, 0, 0, 10],
    },
    {text: "\n"},
    {
      text: '귀하의 노고에 감사드립니다.',
      alignment: 'center',
      fontSize: 13
    },
    // 마지막에 pageBreak 추가
    {text: '', pageBreak: 'after'}
  ];
}

/**
 * 급여명세서(summary)
 * */
export const salaryDocsRef = (datas): TDocumentDefinitions => {
  const date = datas.date;
  // 각 사원별 content를 합침
  const allContents: any[] = [];
  datas.payments.forEach((data, idx) => {
    const content = getSalaryContent(data, date);
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
      fontSize: 10,
    },
    styles: {
      header: {fontSize: 14},
      subheader: {fontSize: 10, marginBottom: 5},
      cell: {fontSize: 9, margin: [0, 5, 0, 5]},
      footer: {fontSize: 9, marginTop: 10},
    }
  };
};

/**
 * 긴 문자열을 일정 길이에서 자르고 "..."을 붙여주는 함수
 */
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};