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

/*
        "products": [
            {
                "id": "8167a733-0b24-4657-bf73-34fc3ecef5ab",
                "bridgeId": "425090b0-d660-401d-8806-ce4ac1e88d23",
                "productName": "string",
                "info": {
                    "id": "b37056f2-14fd-4e64-9c51-7f36bddcf2fb",
                    "scales": [
                        {
                            "id": "1c691068-c637-4f81-b62c-bbfd42cf9cc9",
                            "scale": "2*2*2",
                            "snapshot": {
                                "id": "75874bb4-9376-4e45-88e7-32544b962028",
                                "sequence": 2,
                                "manufactureAmount": "string",
                                "vCutAmount": "string",
                                "rawMatAmount": "string",
                                "productLength": "string",
                                "stocks": 1,
                                "unitWeight": "string",
                                "vCut": "string",
                                "createdAt": "2025-03-18T07:30:26.987Z"
                            }
                        },
                        {
                            "id": "1c691068-c637-4f81-b62c-bbfd42cf9c33",
                                "scale": "3*3*3",
                                "snapshot": {
                                    "id": "75874bb4-1111-4e45-88e7-32544b962028",
                                    "sequence": 2,
                                    "manufactureAmount": "string",
                                    "vCutAmount": "string",
                                    "rawMatAmount": "string",
                                    "productLength": "string",
                                    "stocks": 1,
                                    "unitWeight": "string",
                                    "vCut": "string",
                                    "createdAt": "2025-03-18T07:30:26.987Z"
                        }
                    ]
                }
            },
            {
                "id": "60fef51b-25b8-426b-89a6-4085e4e4c479",
                "bridgeId": "14ca1b7c-1d2f-4e78-8cb8-6e64943bcac9",
                "productName": "q",
                "info": {
                    "id": "37819de9-7209-43d5-ad1c-4f40655c74bc",
                    "scales": [
                        {
                            "id": "40a4144f-2dc0-406d-b9c5-c1370c195208",
                            "scale": "q",
                            "snapshot": {
                                "id": "d99e7770-1f2f-466c-ac1f-4696521cbfd4",
                                "sequence": 1,
                                "manufactureAmount": "",
                                "vCutAmount": "3",
                                "rawMatAmount": "",
                                "productLength": "3",
                                "stocks": 4,
                                "unitWeight": "1",
                                "vCut": "2",
                                "createdAt": "2025-03-18T07:34:20.867Z"
                            }
                        }
                    ]
                }
            },
            {
                "id": "b825d764-aaaf-4162-bc26-7e1b5253e861",
                "bridgeId": "fef87e3f-8222-48dd-85d0-be576cde25ce",
                "productName": "ddd",
                "info": {
                    "id": "cfd75274-e611-466d-9179-3b0d81dd6539",
                    "scales": [
                        {
                            "id": "e767153c-455d-4d5f-bafe-5b8bf13eaa16",
                            "scale": "dd",
                            "snapshot": {
                                "id": "4910832e-9477-4144-a588-a9163d7bff8a",
                                "sequence": 1,
                                "manufactureAmount": "",
                                "vCutAmount": "11",
                                "rawMatAmount": "",
                                "productLength": "11",
                                "stocks": 0,
                                "unitWeight": "11",
                                "vCut": "11",
                                "createdAt": "2025-03-18T07:18:12.638Z"
                            }
                        }
                    ]
                }
            },
            {
                "id": "317d41e0-9d68-484e-8547-0d80b1792f30",
                "bridgeId": "20a47041-45ee-4297-b1ca-26162d2c5655",
                "productName": "dd",
                "info": {
                    "id": "6421090d-739a-4661-a2c8-9113ba4c05a8",
                    "scales": [
                        {
                            "id": "79d27439-98db-47b9-9ec0-bf7288532173",
                            "scale": "dd",
                            "snapshot": {
                                "id": "29fd005f-cd05-40e7-ba83-60c578fa797a",
                                "sequence": 1,
                                "manufactureAmount": "",
                                "vCutAmount": "1",
                                "rawMatAmount": "",
                                "productLength": "1",
                                "stocks": 1,
                                "unitWeight": "dd",
                                "vCut": "1",
                                "createdAt": "2025-03-18T07:31:02.494Z"
                            }
                        }
                    ]
                }
            },
            {
                "id": "1087e60c-d44b-41be-aff9-381baee1b1b6",
                "bridgeId": "2878d917-599f-4b55-ba13-8eb4e4f8be6d",
                "productName": "d",
                "info": {
                    "id": "066df9f6-4954-4b20-9bd6-896740ee34c3",
                    "scales": [
                        {
                            "id": "645b5582-6293-4d41-8bbe-d839b5c55be9",
                            "scale": "d",
                            "snapshot": {
                                "id": "bdb6f494-91eb-4614-b74e-02f1abb42d92",
                                "sequence": 1,
                                "manufactureAmount": "",
                                "vCutAmount": "",
                                "rawMatAmount": "",
                                "productLength": "",
                                "stocks": 0,
                                "unitWeight": "",
                                "vCut": "",
                                "createdAt": "2025-03-18T07:03:02.448Z"
                            }
                        }
                    ]
                }
            }
        ],
*/