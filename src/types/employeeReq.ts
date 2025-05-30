export interface PostEmployee {
  banks?: PostBank | null;
  info: {
    name: string;
    age: string | number;
    countryCode: string;
    position: string;
    email?: string | null;
    address?: string | null;
    birth?: string | null;
    phoneNumber?: string | null;
  },
  startWorkingAt: string;
}

interface PostBank {
  accountNumber: string;
  accountOwner: string;
  bankName: string;
}

export interface PatchEmployee {
  id: string;
  info: {
    name: string;
    age: string | number;
    countryCode: string;
    position: string;
    email?: string | null;
    address?: string | null;
    birth?: string | null;
    phoneNumber?: string | null;
  },
  startWorkingAt?: string | null;
  retirementAt?: string | null;
}

export interface PatchBank {
  id: string;
  accountNumber: string;
  accountOwner?: string;
  bankName: string;
}
