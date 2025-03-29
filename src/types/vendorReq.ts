export interface PostVendorReqBody {
  name: string,
  telNumber: string | null,
  subTelNumber: string | null,
  phoneNumber: string | null,
  businessNumber: string | null
}

export interface PostVendorBankReqBody {
  // 모두 필수값
  infoId: string;
  bankName: string;
  accountNumber: string;
  accountOwner: string;
}

export interface PatchVendorBankReqBody {
  bankId: string;         // 필수
  bankName: string;
  accountNumber: string;
  accountOwner: string;
}

export interface PostVendorReceiptReqBody {
  vendorId: string;
  companyName: string;
  productName: string;
  productPrice: string;
  quantity: number;
  vatRate: number;
  vat?: boolean;
  isPaying?: boolean;
}