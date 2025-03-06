// 제품 데이터 타입 정의
interface ProductItem {
  productName: string;
  scale: Record<
    string,
    {
      unitWeight: string;
      stocks: string;
      rawMatAmount: string;
      manufactureAmount: string;
      productLength: string;
    }
  >;
}

export const itemList: ProductItem[] = [
  {
    'productName': '스테인리스 강판',
    'scale': {
      '1x1x1': {
        "unitWeight": "4.8kg",
        "stocks": '9',
        "rawMatAmount": "5400",
        "manufactureAmount": "28000",
        "productLength": "130"
      },
      '1x2x2': {
        "unitWeight": "5.1kg",
        "stocks": '6',
        "rawMatAmount": "6200",
        "manufactureAmount": "32000",
        "productLength": "180"
      }
    }
  },
  {
    'productName': '알루미늄 시트',
    'scale': {
      '1x1x0.5': {
        "unitWeight": "2.3kg",
        "stocks": '12',
        "rawMatAmount": "3000",
        "manufactureAmount": "20000",
        "productLength": "100"
      },
      '2x2x1': {
        "unitWeight": "3.1kg",
        "stocks": '8',
        "rawMatAmount": "4100",
        "manufactureAmount": "25000",
        "productLength": "140"
      }
    }
  },
  {
    'productName': '구리 합금판',
    'scale': {
      '2x1x1': {
        "unitWeight": "4.5kg",
        "stocks": '5',
        "rawMatAmount": "5000",
        "manufactureAmount": "30000",
        "productLength": "150"
      },
      '3x2x2': {
        "unitWeight": "6.2kg",
        "stocks": '7',
        "rawMatAmount": "7000",
        "manufactureAmount": "35000",
        "productLength": "200"
      }
    }
  },
  {
    'productName': '철강 빔',
    'scale': {
      '1x3x1': {
        "unitWeight": "6.0kg",
        "stocks": '12',
        "rawMatAmount": "6000",
        "manufactureAmount": "35000",
        "productLength": "200"
      },
      '2x4x1': {
        "unitWeight": "7.5kg",
        "stocks": '10',
        "rawMatAmount": "7500",
        "manufactureAmount": "40000",
        "productLength": "250"
      }
    }
  },
  {
    'productName': '아연 도금 철판',
    'scale': {
      '1x1x1': {
        "unitWeight": "1.8kg",
        "stocks": '20',
        "rawMatAmount": "2700",
        "manufactureAmount": "21000",
        "productLength": "90"
      },
      '2x2x1': {
        "unitWeight": "3.0kg",
        "stocks": '15',
        "rawMatAmount": "4200",
        "manufactureAmount": "25000",
        "productLength": "120"
      }
    }
  },
  {
    'productName': '티타늄 합금',
    'scale': {
      '2x2x1.5': {
        "unitWeight": "5.1kg",
        "stocks": '6',
        "rawMatAmount": "6200",
        "manufactureAmount": "32000",
        "productLength": "180"
      },
      '3x3x2': {
        "unitWeight": "7.3kg",
        "stocks": '5',
        "rawMatAmount": "7400",
        "manufactureAmount": "35000",
        "productLength": "220"
      }
    }
  },
  {
    'productName': '니켈 합금',
    'scale': {
      '1x2x1': {
        "unitWeight": "4.2kg",
        "stocks": '10',
        "rawMatAmount": "5300",
        "manufactureAmount": "27000",
        "productLength": "125"
      },
      '2x3x2': {
        "unitWeight": "5.8kg",
        "stocks": '8',
        "rawMatAmount": "6800",
        "manufactureAmount": "31000",
        "productLength": "190"
      }
    }
  },
];

export default itemList;