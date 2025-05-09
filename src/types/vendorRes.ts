export interface PostVendorResData {
  id: string,
  name: string,
  info: {
    id: string,
    telNumber: string | undefined,
    subTelNumber: string | undefined,
    phoneNumber: string | undefined,
    businessNumber: string | undefined,
    bankId: string | undefined,
    createdAt: string | undefined,
  },
  receipts: any[] | undefined,
  createdAt: string
}

export interface GetVendorResData {
  id: string;
  name: string;
  info: {
    id: string;
    telNumber?: string | null;
    subTelNumber?: string | null;
    phoneNumber?: string | null;
    businessNumber?: string | null;
    bankId?: string[] | null;
    address?: string | null;
    createdAt: string;
  };
  receipts: any[];
  createdAt: string;
  bank: Bank[] | null | undefined;
}

export interface Bank {
  id: string;
  bankName: string;
  accountNumber: string;
  accountOwner: string;
  createdAt: string;
}

export interface GetVendorReceiptResData {
  id: string,
  productName: string,
  unitPrice: string,
  productPrice: string,
  totalManufactureAmount: string,
  totalRawMatAmount: string,
  totalVatPrice: string,
  vatPrice: string,
  quantity: 2,
  totalPrice: string,
  vat: boolean,
  payableBalance: string,
  isPaying: boolean,
  createdAt: string
}