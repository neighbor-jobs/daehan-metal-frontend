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