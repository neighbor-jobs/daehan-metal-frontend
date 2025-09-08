import Store from 'electron-store';
import {Employee} from '../../src/types/employeeRes.ts';
import axios from 'axios';

interface CacheEmployee {
  id: string;
  pay: string;
}

/*김상동	이우석	최종인	퀀 제이슨	브라얀	레이니어	양희경	신진아*/
/*
const defaultList = [
  '9e2d8c1f-fcc1-4400-bdcb-3fd082034685',
  '69177ced-a2ae-4c39-9578-092e69d03409',
  '0cc39c93-ac5d-430e-a247-db95d4a25556',
  'b89bfc06-45c4-4c36-ae3c-ab35dffdb317',
  '16297d6a-addf-497b-9426-27d51eeb772f',
  'cb0aae57-ee1c-4178-9cf4-6c3b1059aa5e',
  'ec7fd3b3-d952-4f10-b3ed-92e71c048e58',
  'a1954851-044b-4fce-83b8-0fd61e5d4836',
]
*/
/*[
  {
    "id": "9e2d8c1f-fcc1-4400-bdcb-3fd082034685",
    "bankIds": [
      "8e6a03c3-922d-4c11-9998-66e3e9832d21"
    ],
    "info": {
      "id": "55a90853-44a3-440c-ba60-3c286312fa6b",
      "name": "김상동",
      "age": 57,
      "position": "생산직 부장",
      "countryCode": "내국인",
      "birth": "1968-06-10T00:00:00.000Z",
      "address": "경기 김포 김포한강9로11, 401동1001(구래동 김포한강 예미지)",
      "phoneNumber": "010-4743-8169",
      "email": null
    },
    "payments": [],
    "startWorkingAt": "2025-07-19T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "70e939e0-e311-45de-bdc6-98f552a0b27b",
    "bankIds": [
      "e066a0b0-8217-48f8-a4b8-27905f3d9590"
    ],
    "info": {
      "id": "9729b39f-b345-464f-8364-bc8955dd6d8a",
      "name": "박신석",
      "age": 62,
      "position": "대표",
      "countryCode": "내국인",
      "birth": "1962-09-03T00:00:00.000Z",
      "address": "인천 계양구 평리길2",
      "phoneNumber": "010-6395-3438",
      "email": "park21151515@naver.com"
    },
    "payments": [],
    "startWorkingAt": "2013-01-01T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "a1954851-044b-4fce-83b8-0fd61e5d4836",
    "bankIds": [
      "7986b9cb-2010-4b46-8c48-42c269cfc297"
    ],
    "info": {
      "id": "88ee39cc-8dbe-4014-bc06-5c86392fee2b",
      "name": "신진아",
      "age": 59,
      "position": "영업부 사원",
      "countryCode": "내국인",
      "birth": "1966-03-07T00:00:00.000Z",
      "address": "서울 강서구 양천로 63길 38 105/1402",
      "phoneNumber": null,
      "email": "park21151515@naver.com"
    },
    "payments": [],
    "startWorkingAt": "2021-06-01T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "ec7fd3b3-d952-4f10-b3ed-92e71c048e58",
    "bankIds": [],
    "info": {
      "id": "3abd3d1b-37f7-419b-8ddc-3d272451a4a1",
      "name": "양희경",
      "age": 52,
      "position": "사무직",
      "countryCode": "내국인",
      "birth": "1974-08-08T00:00:00.000Z",
      "address": "인천 계양구 장제로878 113동 402호",
      "phoneNumber": null,
      "email": null
    },
    "payments": [],
    "startWorkingAt": "2017-02-16T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "69177ced-a2ae-4c39-9578-092e69d03409",
    "bankIds": [
      "1a2fe444-5063-4dc9-9092-c3d10d648aa8"
    ],
    "info": {
      "id": "4faa5ea5-efcb-497d-b276-ca6cdc94bf16",
      "name": "이우석",
      "age": 54,
      "position": "생잔직 과장",
      "countryCode": "내국인",
      "birth": "1971-04-27T00:00:00.000Z",
      "address": "부평구 삼산동 진흥빌라다동 103호",
      "phoneNumber": "006-390-9918",
      "email": "ucc0427@naver.com"
    },
    "payments": [],
    "startWorkingAt": "2023-04-01T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "0cc39c93-ac5d-430e-a247-db95d4a25556",
    "bankIds": [
      "5b763b9d-1002-4d5b-a630-450e4bc82d62"
    ],
    "info": {
      "id": "b503cef1-3dae-4467-8836-24e702ec56b5",
      "name": "최종인",
      "age": 60,
      "position": "생산직 대리",
      "countryCode": "내국인",
      "birth": "1965-02-07T00:00:00.000Z",
      "address": "인천 계양 아나지로 199. 506동 1104호(효성동, 뉴서울5차아파트)",
      "phoneNumber": "010-2329-6565",
      "email": null
    },
    "payments": [],
    "startWorkingAt": "2016-07-11T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "cb0aae57-ee1c-4178-9cf4-6c3b1059aa5e",
    "bankIds": [
      "497eae12-e73d-479e-baae-77ac70a2c689"
    ],
    "info": {
      "id": "433e77ec-b869-40a1-b849-2bc360b9c8d2",
      "name": "가랍 레이니",
      "age": 26,
      "position": "생산직 사원",
      "countryCode": "외국인",
      "birth": "2000-09-02T00:00:00.000Z",
      "address": "인천 계양구 평리길92",
      "phoneNumber": "010-4882-0209",
      "email": null
    },
    "payments": [],
    "startWorkingAt": "2023-10-31T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "16297d6a-addf-497b-9426-27d51eeb772f",
    "bankIds": [
      "7a08191a-aae6-4538-8d80-4e4e148a2b35"
    ],
    "info": {
      "id": "c9c82f14-3164-46fb-b716-a2703b544004",
      "name": "사굼 브라얀",
      "age": 29,
      "position": "생산직 사원",
      "countryCode": "외국인",
      "birth": "1996-06-16T00:00:00.000Z",
      "address": "인천 계양구 평리길92",
      "phoneNumber": "010-8495-5037",
      "email": null
    },
    "payments": [],
    "startWorkingAt": "2025-06-06T00:00:00.000Z",
    "retirementAt": null
  },
  {
    "id": "b89bfc06-45c4-4c36-ae3c-ab35dffdb317",
    "bankIds": [
      "b24e20d3-a779-4f6a-bfc0-8c6460ece7cb"
    ],
    "info": {
      "id": "02662cc1-35f9-498d-b48b-17b7cdfa51d5",
      "name": "퀀 제이슨",
      "age": 36,
      "position": "생산직 사원",
      "countryCode": "외국인 (필리핀)",
      "birth": "1989-09-24T00:00:00.000Z",
      "address": "계양구 평리길92",
      "phoneNumber": "010-8495-9827",
      "email": null
    },
    "payments": [],
    "startWorkingAt": "2022-02-04T00:00:00.000Z",
    "retirementAt": null
  }
]*/

// ngrok 용
/*{
    "data": [
        {
            "id": "c98e384a-c3e7-4572-abb6-6607c2977eae",
            "bankIds": [
                "ec0dee19-1094-4841-867d-fa5108a5c164"
            ],
            "info": {
                "id": "24428817-98c4-499e-b3ac-ab5d00db6088",
                "name": "마팀장",
                "age": 46,
                "position": "관리직",
                "countryCode": "내국인",
                "birth": "1980-02-20T00:00:00.000Z",
                "address": "서울",
                "phoneNumber": "010-0202-0101",
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2020-07-10T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "d35e46bb-a860-4eda-8ee6-25119e10f320",
            "bankIds": [
                "f51aecfa-58fc-4f34-b5e0-3c59ad1555b4"
            ],
            "info": {
                "id": "aaf8d602-eec7-4603-832e-e4e9dd5a9e16",
                "name": "가사원",
                "age": 28,
                "position": "생산직",
                "countryCode": "내국인",
                "birth": "1998-01-06T00:00:00.000Z",
                "address": "",
                "phoneNumber": "010-0900-9920",
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2025-07-23T00:00:00.000Z",
            "retirementAt": "2025-10-10T00:00:00.000Z"
        },
        {
            "id": "3bbaaaf3-abbb-497f-b456-36d412481b88",
            "bankIds": [
                "6e90c03b-2a79-4405-85d7-f8bfccd87a21"
            ],
            "info": {
                "id": "e3f28fc1-f001-422d-84a1-e5419d48e303",
                "name": "라대리",
                "age": 36,
                "position": "생산직",
                "countryCode": "내국인",
                "birth": "1990-06-06T00:00:00.000Z",
                "address": "부산",
                "phoneNumber": "010-2299-0101",
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2025-07-23T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "afe9e707-766d-49ba-87bd-fdb543a50e5b",
            "bankIds": [
                "8a320ab9-3b8a-433c-8db3-93892407bb8e"
            ],
            "info": {
                "id": "13763ba4-e413-47dc-be14-5b2946dacc1e",
                "name": "다사원",
                "age": 31,
                "position": "사무직",
                "countryCode": "내국인",
                "birth": "1995-01-02T00:00:00.000Z",
                "address": "인천",
                "phoneNumber": "02-9999-8787",
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2025-07-23T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "65a120c3-b295-40bd-ad30-f836f27b3014",
            "bankIds": [
                "e04dda2c-0cc9-415d-a53b-6ff7b26d271d"
            ],
            "info": {
                "id": "d24bfc44-8027-4b53-aedf-76ecfd5b2377",
                "name": "나인턴",
                "age": 26,
                "position": "생산직",
                "countryCode": "내국인",
                "birth": "2000-04-02T00:00:00.000Z",
                "address": "서울",
                "phoneNumber": "010-9090-9090",
                "email": "nana@naver.com "
            },
            "payments": [],
            "startWorkingAt": "2025-07-23T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "c3bba005-4f2b-4fea-964f-eae7815ddbd2",
            "bankIds": [
                "5be6fbc5-e373-4440-a726-b379f84b31c0"
            ],
            "info": {
                "id": "713b7457-85a8-4552-8dd2-5d273841f8d1",
                "name": "구사원",
                "age": 71,
                "position": "조상님",
                "countryCode": "내국인",
                "birth": "1955-02-09T00:00:00.000Z",
                "address": "",
                "phoneNumber": "010-2234-5678",
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2025-08-01T00:00:00.000Z",
            "retirementAt": null
        }
    ],
    "message": "",
    "statusCode": 200
}*/

const schema = {
  employees: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        pay: { type: 'string', default: '0' },
      },
      required: ['id']
    },
    default: [] as CacheEmployee[]
  }
}
const employeeStore = new Store({
  schema,
  name: 'employees',
  cwd: 'store'
})

// GET employees
const fetchEmployees = async (): Promise<CacheEmployee[] | undefined> => {
  try {
    const res = await axios.get('http://localhost:3000/employee?includesRetirement=true&orderIds=&includesPayment=false');
    return res.data.data?.map((e: Employee) => ({
      id: e.id,
      pay: '0'
    }));
  } catch {
    console.error('fail fetching employee store');
  }
};

// 초기화
export const initEmployee = async () => {
  const employees = getEmployees();
  if (employees?.length > 0) return;

  const apiEmployees = await fetchEmployees();
  if (Array.isArray(apiEmployees))
    employeeStore.set('employees', apiEmployees);
  else
    employeeStore.set('employees', []);
};

/** 사원 배열 순서 조회 */
export const getEmployees = (): CacheEmployee[] => {
  return employeeStore.get('employees') as CacheEmployee[]
}

/** 캐시-DB 데이터 정합성 검증 */
export const validateEmployeesAgainstAPI = async () => {
  const storedEmployees = getEmployees();
  const apiEmployees = await fetchEmployees();

  if (!Array.isArray(apiEmployees)) {
    console.error('employee API 데이터 불러오기 실패');
    return;
  }

  // 캐시 중복 제거 (id 기준)
  let cleanedStored = Array.from(new Map(storedEmployees.map(e => [e.id, e])).values());

  const storedIds = cleanedStored.map(e => e.id);
  const apiIds = apiEmployees.map(e => e.id);

  // API에는 있고 캐시에는 없는 ID → 추가
  const missingInCache = apiEmployees.filter(e => !storedIds.includes(e.id));

  // 캐시에는 있지만 API에는 없는 ID → 삭제
  const outdatedInCache = cleanedStored.filter(e => !apiIds.includes(e.id));

  // outdated 제거
  cleanedStored = cleanedStored.filter(e => !outdatedInCache.some(o => o.id === e.id));

  // missing 추가
  cleanedStored = [...cleanedStored, ...missingInCache];

  if (
    cleanedStored.length !== storedEmployees.length ||
    JSON.stringify(new Set(storedIds)) !== JSON.stringify(new Set(apiIds))
  ) {
    employeeStore.set('employees', cleanedStored);
    console.log(`정합성 검증 완료: ${missingInCache.length}개 추가, ${outdatedInCache.length}개 삭제, ${storedEmployees.length} → ${cleanedStored.length}`);
  } else {
    console.log('정합성 검증: 변경 없음');
  }
};

/** 사원 추가 */
export const addEmployee = (newEmployeeId: string): void => {
 const prev = getEmployees();
  const cur: CacheEmployee[] = [
    ...prev,
    {id: newEmployeeId, pay: '0'}
  ];
  employeeStore.set('employees', cur);
}

/** 전체 사원 배열 순서만 교체 */
export const replaceEmployees = (newEmployees: Employee[]): void => {
  const stored = getEmployees(); // CacheEmployee[]

  // id -> CacheEmployee 매핑
  const storedMap = new Map(stored.map(e => [e.id, e]));

  // 새 Employees 순서대로 정렬 (기존 pay 유지)
  const reordered = newEmployees.map(item => {
    const existing = storedMap.get(item.id);
    return existing ?? { id: item.id, pay: '0' };
  });

  employeeStore.set('employees', reordered);
};

/** 최근 급여 싹 다 업데이트 */
export const updateEmployees = (newEmployees: CacheEmployee[]) => {
  const stored = getEmployees(); // CacheEmployee[]

  // id → pay 매핑
  const payMap = new Map(newEmployees.map(e => [e.id, e.pay]));

  const updated = stored.map(item =>
    payMap.has(item.id)
      ? { ...item, pay: payMap.get(item.id) ?? item.pay }
      : item
  );

  employeeStore.set('employees', updated);
};

/** 사원 삭제 */
export const removeEmployee = (id: string): void => {
  const prev = getEmployees();
  employeeStore.set('employees', prev.filter(e => e.id !== id));
}