export interface PostVendorReqBody {
  name: string,
  telNumber?: string | undefined,
  subTelNumber?: string | undefined,
  phoneNumber?: string | undefined,
  businessNumber?: string | undefined,
  address: string | undefined,
}

export interface PostVendorBankReqBody {
  // 모두 필수값
  infoId: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountOwner: string | null;
}

export interface PatchVendorBankReqBody {
  infoId?: string | null | undefined;
  bankId: string | null;         // 필수
  bankName: string | null;
  accountNumber: string | null;
  accountOwner: string | null;
}

export interface PostVendorReceiptReqBody {
  vendorId: string;
  companyName: string;
  productName: string;
  productPrice: string;
  manufactureAmount: string,
  rawMatAmount: string,
  quantity: number;
  vatRate: number | string;
  vat?: boolean;
  isPaying?: boolean;
}