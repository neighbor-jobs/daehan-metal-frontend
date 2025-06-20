export interface TableColumns<T> {
  id: T;
  label: string;
  minWidth?: number;
  align?: 'right' | 'center';
  format?: (value: string | string[] | number, numValue?: number) => string | number;
  disabled?: boolean;
}

/*
* ==================== 급여 대장 ========================
*/
export enum PaymentTableRow {
  PAY = 'pay',
  WORKING_DAY = 'workingDay',
  HOURLY_WAGE = 'hourlyWage',
  EXTEND_WORKING_TIME = 'extendWorkingTime',
  EXTEND_WORKING_MULTI = 'extendWorkingMulti',
  EXTEND_WORKING_WAGE = 'extendWokringWage',
  DAY_OFF_WORKING_TIME = 'dayOffWorkingTime',
  DAY_OFF_WORKING_MULTI = 'dayOffWorkingMulti',
  DAY_OFF_WORKING_WAGE = 'dayOffWorkingWage',
  ANNUAL_LEAVE_ALLOWANCE_MULTI = 'annualLeaveAllowanceMulti',
  ANNUAL_LEAVE_ALLOWANCE = 'annualLeaveAllowance',
  MEAL_ALLOWANCE = 'mealAllowance',
  TOTAL_PAYMENT = 'totalPayment',
  SALARY = 'salary',
  // DEDUCTION = 'deduction',
  TOTAL_SALARY = 'totalSalary',
}

export enum DeductionTableRow {
  INCOME_TAX = '소득세',
  RESIDENT_TAX = '주민세',
  HEALTH_INSURANCE = '건강보험료(요양포함)',
  NATIONAL_PENSION = '국민연금',
  EMPLOYMENT_INSURANCE = '고용보험',
  YEAR_END_ADJUSTMENT = '작년연말정산',
  DEDUCTION = 'deduction',
}

export const defaultDeductionList = [
  '소득세',
  '주민세',
  '건강보험료(요양포함)',
  '국민연금',
  '고용보험',
  '작년연말정산'
]

/*
* ==================== 근무자 관리 ========================
*/
export enum EmployeeTableColumn {
  HireDate = 'hireDate',
  EMPLOYEE_NAME = 'employeeName',
  POSITION = 'position',
  PHONE_NUMBER = 'phoneNumber',
}


/*
* ==================== 매출관리 ========================
*/
export enum RevenueMainColumn {
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  LOCATION_NAMES = 'locationNames',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  TOTAL_RAW_MAT_AMOUNT = 'totalRawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'totalManufactureAmount',
  PRODUCT_LENGTH = 'productLength',
}

export enum TransactionRegisterColumn {
  ITEM = 'item',
  SCALE = 'scale',
  COUNT = 'count',
  MATERIAL_PRICE = 'materialPrice',
  MATERIAL_TOTAL_PRICE = 'materialTotalPrice',
  PROCESSING_PRICE = 'processingPrice',
  PROCESSING_TOTAL_PRICE = 'processingTotalPrice',
  TOTAL_AMOUNT = 'totalAmount',
}

export enum DailySalesColumn {
  DATE = 'createdAt',
  COMPANY_NAME = 'companyName',
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  PRODUCT_LENGTH = 'productLength',
}

export enum ClientSalesColumn {
  DATE = 'createdAt',
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  QUANTITY = 'quantity',
  TOTAL_RAW_MAT_AMOUNT = 'rawMatAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'manufactureAmount',
  PRODUCT_LENGTH = 'productLength',
}

export enum ClientSalesSummaryColumn {
  COMPANY_NAME = 'companyName',
  TOTAL_RAW_MAT_AMOUNT = 'totalRawMatAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'totalManufactureAmount',
  TOTAL_PAYING_AMOUNT = 'totalPayingAmount',
}

export enum ItemSalesColumn {
  DATE = 'createdAt',
  COMPANY_NAME = 'companyName',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  TOTAL_RAW_MAT_AMOUNT = 'totalRawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'totalManufactureAmount',
  PRODUCT_LENGTH = 'productLength',
  TOTAL_SALES_AMOUNT = 'totalSalesAmount',
}

export enum ItemSalesSummaryColumn {
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  QUANTITY = 'quantity',
  RAW_MAT_AMOUNT = 'rawMatAmount',
  TOTAL_RAW_MAT_AMOUNT = 'totalRawMatAmount',
  MANUFACTURE_AMOUNT = 'manufactureAmount',
  TOTAL_MANUFACTURE_AMOUNT = 'totalManufactureAmount',
  TOTAL_SALES_AMOUNT = 'totalSalesAmount',
}

/*{
            "salesReport": {
                "receiptId": "1e0e87b4-27db-40de-9374-08242e038888",
                "companyName": "가거래처",
                "productName": "가이드마감",
                "vCutAmount": "0",
                "rawMatAmount": "1000",
                "manufactureAmount": "2000",
                "quantity": 0,
                "productLength": "0",
                "scale": "1.2TX4X8",
                "vCut": "0",
                "createdAt": "2025-05-07T00:00:00.000Z"
            },
            "totalManufactureAmount": "0",
            "totalRawMatAmount": "0",
            "totalSalesAmount": "0"
        }*/

export enum ClientOutstandingBalanceColumn {
  COMPANY_NAME = 'companyName',
  CARRYOVER_AMOUNT = 'carryoverAmount',
  SALES_AMOUNT = 'salesAmount',
  PAYING_AMOUNT = 'payingAmount',
  OUTSTANDING_AMOUNT = 'outstandingAmount',
  PHONE_NUMBER = 'phoneNumber',
}

/*
* ==================== 거래처관리 ========================
*/

export interface SalesCompanyColumn {
  id: 'companyName' | 'ownerName' | 'phoneNumber' | 'locationNames' | 'fax' | 'address' | 'businessType' | 'businessCategory' | 'businessNumber';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string | string[]) => string;
}

export enum PurchaseCompanyColumn {
  NAME = 'name',
  PHONE_NUMBER = 'phoneNumber',
  SUB_TEL_NUMBER = 'subTelNumber',
  TEL_NUMBER = 'telNumber',
  BUSINESS_NUMBER = 'businessNumber',
  ADDRESS = 'address',
}


/*
* ==================== 품목관리 ========================
*/

export interface ProductMainColumn {
  id: 'name' | 'scale';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

/*
* ==================== 매입관리 ========================
*/
export interface DailyPurchaseColumn {
  id: 'date' | 'client' | 'productName' | 'scale' | 'count' | 'material-unit-price' | 'material-price' | 'processing-unit-price' | 'processing-price' | 'total-amount' | 'paying-amount' | 'remaining-amount';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: string) => string;
}

export enum ClientPurchasesColumn {
  DATE = 'date',
  PRODUCT_NAME = 'productName',
  SCALE = 'scale',
  COUNT = 'count',
  MATERIAL_UNIT_PRICE = 'materialUnitPrice',
  MATERIAL_PRICE = 'materialPrice',
  PROCESSING_UNIT_PRICE = 'processingUnitPrice',
  PROCESSING_PRICE = 'processingPrice',
  TOTAL_AMOUNT = 'totalAmount',
  PAYING_AMOUNT = 'payingAmount',
  REMAINING_AMOUNT = 'remainingAmount',
}

export enum MonthlyPurchaseColumn {
  CREATED_AT = 'createdAt',
  PRODUCT_NAME = 'productName',
  QUANTITY = 'quantity',
  UNIT_PRICE = 'unitPrice',
  TOTAL_SALES_AMOUNT = 'totalSalesAmount',
  TOTAL_VAT_AMOUNT = 'totalVatAmount',
  TOTAL_PRICE = 'totalPrice',
  PRODUCT_PRICE = 'productPrice',
  PAYABLE_BALANCE = 'payableBalance',
}


export enum ClientPurchasesSummaryColumn {
  CLIENT = 'client',
  MATERIAL_PRICE = 'materialPrice',
  PROCESSING_PRICE = 'processingPrice',
  TOTAL_AMOUNT = 'totalAmount',
  PAYING_AMOUNT = 'payingAmount',
  REMAINING_AMOUNT = 'remainingAmount',
}

export enum PurchaseRegisterColumn {
  PRODUCT_NAME = 'productName',
  PRODUCT_PRICE = 'productPrice',   // 입금액으로 사용
  QUANTITY = 'quantity',
  MANUFACTURE_AMOUNT = "manufactureAmount",
  TOTAL_MANUFACTURE_AMOUNT = "totalManufactureAmount",
  RAW_MAT_AMOUNT = "rawMatAmount",
  TOTAL_RAW_MAT_AMOUNT = "totalRawMatAmount",
  VAT = 'vat',
  VAT_AMOUNT = 'vatAmount',        // 매입세액
  VAT_RATE = 'vatRate',
  IS_PAYING = 'isPaying',
  TOTAL_AMOUNT = 'totalAmount'
}