import {TDocumentDefinitions} from 'pdfmake/interfaces';
/*
export const invoiceDocDefinition = (invoiceData: any) => {
  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        table: {
          body: [
            [{text: 'Header with Colspan = 4', style: 'tableHeader', colSpan: 2, alignment: 'center'}, '', {text: 'Header 3', style: 'tableHeader', alignment: 'center'}],
            [{text: 'Header 1', style: 'tableHeader', alignment: 'center'}, {text: 'Header 2', style: 'tableHeader', alignment: 'center'}, {text: 'Header 3', style: 'tableHeader', alignment: 'center'}],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            [{rowSpan: 3, text: 'rowSpan set to 3\nLorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor'}, 'Sample value 2', 'Sample value 3'],
            ['', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', 'Sample value 2', 'Sample value 3'],
            ['Sample value 1', {colSpan: 2, rowSpan: 2, text: 'Both:\nrowSpan and colSpan\ncan be defined at the same time'}, ''],
            ['Sample value 1', '', ''],
          ]
        }
      }
    ]
    ,
    defaultStyle: {
      font: 'Pretendard',
    },
  }
  return docDefinition;
}
*/

export const companySalesSumDocDef = (companyName: string, date: Date, companySalesSumData: any[]) => {
  const today = new Date();
  const docDef: TDocumentDefinitions = {
    header: (currentPage, pageCount) => ({
      columns: [
        { text: `Page ${currentPage} / ${pageCount}`, alignment: 'right' }, // ✅ 페이지 번호 오른쪽 정렬
      ],
      margin: [40, 10, 40, 0], // 좌우 여백 조정
    }),
    content: [
      {
        text: `${companyName} 매출현황`,
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
              { text: new Date().toISOString().split('T')[0], style: 'tableText' }, // 임시 날짜
              { text: item.client, style: 'tableText' }, // 품명 (거래처명)
              { text: '1', style: 'tableText' }, // 수량 (기본값 1)
              { text: Number(item['material-price']).toLocaleString(), style: 'tableText' }, // 재료비
              { text: Number(item['processing-price']).toLocaleString(), style: 'tableText' }, // 가공비
              { text: Number(item['vcut-processing-price']).toLocaleString(), style: 'tableText' }, // V컷 가공비
              { text: Number(item['total-amount']).toLocaleString(), style: 'tableText' }, // 총 금액
              { text: Number(item['received-amount']).toLocaleString(), style: 'tableText' }, // 수금액
              { text: Number(item['remaining-amount']).toLocaleString(), style: 'tableText' }, // 잔액
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
      header: { fontSize: 14, },
      subheader: { fontSize: 10, marginBottom: 20 },
    },
  };
  return docDef;
}
