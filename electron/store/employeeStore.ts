import Store from 'electron-store';
import {Employee} from '../../src/types/employeeRes.ts';
import axios from 'axios';
import {Deduction} from '../../src/types/ledger.ts';

// TODO: 공제 관련 코드 추가
export interface CacheEmployee {
  id: string;
  name: string;
  pay: string;
  deductions: Deduction[];
  memo: string;
}

/*김상동	이우석	최종인	퀀 제이슨	브라얀	레이니어	양희경	신진아*/
const schema = {
  employees: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: {type: 'string'},
        name: {type: 'string'},
        pay: {type: 'string', default: '0'},
        deductions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              purpose: {type: 'string'},
              value: {type: 'string', default: '0'},
            }
          }
        },
        memo: {type: 'string', default: ''},
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
    // const res = await axios.get('https://saving-finer-fly.ngrok-free.app/employee?includesRetirement=true&orderIds=&includesPayment=false');
    const res = await axios.get('http://localhost:3000/employee?includesRetirement=true&orderIds=&includesPayment=false');
    return res.data.data?.map((e: Employee) => ({
      id: e.id,
      name: e.info.name,
      pay: '0',
      deductions: [],
      memo: '',
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
  /* API 응답
   {
    "data": [
        {
            "id": "c0ca8d6b-e196-4601-861c-e725ca84bc99",
            "bankIds": [],
            "info": {
                "id": "44969baa-bec2-41c3-a616-78bfbbeaf11d",
                "name": "최종인",
                "age": 60,
                "position": "생산직",
                "countryCode": "내국인",
                "birth": "1965-02-07T00:00:00.000Z",
                "address": null,
                "phoneNumber": null,
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2016-07-11T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "9ce94b95-8fea-4efd-951a-0b73c6110daf",
            "bankIds": [],
            "info": {
                "id": "d9b4c49d-ef0a-4fc4-9ed3-097c3d2ed20c",
                "name": "제이슨",
                "age": 35,
                "position": "생산직",
                "countryCode": "외국인",
                "birth": "1989-09-24T00:00:00.000Z",
                "address": null,
                "phoneNumber": null,
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2022-02-04T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "82548def-d149-4431-8975-4785e3519668",
            "bankIds": [],
            "info": {
                "id": "7f7b60c6-46bc-4a48-8891-6c6684c5a06c",
                "name": "이우석",
                "age": 54,
                "position": "생산직",
                "countryCode": "내국인",
                "birth": "1971-04-27T00:00:00.000Z",
                "address": null,
                "phoneNumber": null,
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2023-04-01T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "3437cbc9-8668-4087-b312-25dca112e03a",
            "bankIds": [],
            "info": {
                "id": "ac5f20a7-b34e-450c-bc48-08f97d8165f8",
                "name": "양희경",
                "age": 51,
                "position": "사무직",
                "countryCode": "내국인",
                "birth": "1974-08-08T00:00:00.000Z",
                "address": null,
                "phoneNumber": null,
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2017-02-16T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "6c4bbd19-cd07-46dd-9454-408632d808ee",
            "bankIds": [],
            "info": {
                "id": "c6be570d-fbcb-413c-8850-54d965974f32",
                "name": "브라얀",
                "age": 29,
                "position": "생산직",
                "countryCode": "외국인",
                "birth": "1996-06-16T00:00:00.000Z",
                "address": null,
                "phoneNumber": null,
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2022-06-07T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "86f79ad1-76cf-4089-85c7-ccd7d53dd8b2",
            "bankIds": [],
            "info": {
                "id": "52e086e8-729c-4406-8b97-0408a3762226",
                "name": "레이니어",
                "age": 25,
                "position": "생산직",
                "countryCode": "외국인",
                "birth": "2000-09-02T00:00:00.000Z",
                "address": null,
                "phoneNumber": null,
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2023-11-01T00:00:00.000Z",
            "retirementAt": null
        },
        {
            "id": "c389dcb7-60c7-4cc4-a9b7-133cf9962346",
            "bankIds": [],
            "info": {
                "id": "d06631f6-32bc-4bfe-bcfe-14bba06515e2",
                "name": "김상동",
                "age": 57,
                "position": "생산직",
                "countryCode": "내국인",
                "birth": "1968-06-10T00:00:00.000Z",
                "address": null,
                "phoneNumber": null,
                "email": null
            },
            "payments": [],
            "startWorkingAt": "2023-07-18T00:00:00.000Z",
            "retirementAt": null
        }
    ],
    "message": "",
    "statusCode": 200
}*/

  if (!Array.isArray(apiEmployees)) {
    console.error('employee API 데이터 불러오기 실패');
    return;
  }

  // 캐시 중복 제거 (id 기준)
  const cleanedStored = Array.from(new Map(storedEmployees.map(e => [e.id, e])).values());

  const storedIdSet = new Set(cleanedStored.map(e => e.id));
  const apiIdSet = new Set(apiEmployees.map(e => e.id));

  const missingInCache: CacheEmployee[] = apiEmployees.filter(e => !storedIdSet.has(e.id)); // API엔 있고 캐시에 없는 것
  const outdatedInCache: CacheEmployee[] = cleanedStored.filter(e => !apiIdSet.has(e.id));  // 캐시에만 있고 API엔 없는 것

  // 4) 머지(삭제 후 추가)
  const kept = cleanedStored.filter(e => apiIdSet.has(e.id)); // 남겨둘 것(기존 pay 유지)
  const merged = [...kept, ...missingInCache];                // 새로 들어온 것은 pay:'0' 상태(또는 apiEmployees의 pay 구조에 맞게)

  // 5) 변경 여부 판단 (멤버십 기준: missing/outdated 존재 여부)
  const hasDiff = missingInCache.length > 0 || outdatedInCache.length > 0;


  if (hasDiff) {
    employeeStore.set('employees', merged);
    console.log(
      `정합성 검증 업데이트: ${missingInCache.length}개 추가, ` +
      `${outdatedInCache.length}개 삭제, ${cleanedStored.length} → ${merged.length}`
    );
  } else {
    console.log('정합성 검증: 변경 없음');
  }
};

/** 사원 추가 */
export const addEmployee = (newEmployeeId: string, newEmployeeName: string): void => {
  const prev = getEmployees();
  const cur: CacheEmployee[] = [
    ...prev,
    {
      id: newEmployeeId,
      name: newEmployeeName,
      pay: '0',
      deductions: [],
      memo: ''
    }
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
    return existing
      ?? {
        id: item.id,
        name: item.info.name,
        pay: '0',
        deductions: [],
        memo: ''
      };
  });

  employeeStore.set('employees', reordered);
};

/** 최근 급여 & 공제 & 메모 싹 다 업데이트 */
export const updateEmployees = (newEmployees: CacheEmployee[]) => {
  const stored = getEmployees();

  // id → CacheEmployee 전체 매핑
  const updateMap = new Map(
    newEmployees.map(e => [e.id, e])
  );

  const updated = stored.map(item => {
    const next = updateMap.get(item.id);
    return next
      ? {
        ...item,
        name: next.name,
        pay: next.pay,
        deductions: next.deductions,
        memo: next.memo,
      } : item;
  });

  employeeStore.set('employees', updated);
};

/** 사원 삭제 */
export const removeEmployee = (id: string): void => {
  const prev = getEmployees();
  employeeStore.set('employees', prev.filter(e => e.id !== id));
}