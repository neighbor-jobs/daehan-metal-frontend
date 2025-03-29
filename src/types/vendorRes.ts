export interface PostVendorResData {
  id: string,
  name: string,
  info: {
   id: string,
   telNumber: string | null,
   subTelNumber: string | null,
   phoneNumber: string | null,
   businessNumber: string | null,
   bankId: string | null,
   createdAt: string | null
  },
  receipts: any[],
  createdAt: string
}

export interface GetVendorResData {
  id: string;
  name: string;
  info: {
    id: string;
    telNumber: string;
    subTelNumber: string;
    phoneNumber: string;
    businessNumber: string;
    bankId: string;
    createdAt: string;
  };
  receipts: any[];
  createdAt: string;
  bank: {
    id: string;
    bankName: string;
    accountNumber: string;
    accountOwner: string;
    createdAt: string;
  };
}