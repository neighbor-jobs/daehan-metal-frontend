import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List, ListItemButton,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Employee} from '../../types/employeeRes.ts';
import {useState} from 'react';
import cacheManager from '../../utils/cacheManager.ts';

interface AssignEmployeesProps {
  isOpened: boolean;
  onClose: () => void;
  employees: Employee[];
  onApply?: (ordered: Employee[]) => void;  // 캐시데이터 형식의 employees
}

const getId = (e: Employee) => e.id ?? e.id;
const getName = (e: Employee) => e.info.name ?? e.info.name;

const AssignEmployees = ({
                           isOpened, onClose, employees, onApply,
                         }: AssignEmployeesProps): React.JSX.Element => {
  const [seq, setSeq] = useState<string[]>([]);

  const toggle = (emp: Employee) => {
    const id = getId(emp);
    setSeq((prev) => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  // 화면에 보여줄 정렬 결과: 선택된 순서 먼저, 나머지는 원래 순서
  const selected = seq
    .map(id => employees.find((e: Employee) => String(getId(e)) === id))
    .filter(Boolean) as Employee[];

  const rest = employees.filter(e => !seq.includes(String(getId(e))));
  const ordered = [...selected, ...rest];

  const handleApply = async () => {
    onApply?.(ordered);
    try {
      await cacheManager.replaceEmployees(ordered);
    } catch {
      console.error('캐시데이터 업데이트 실패');
    }
    onClose();
  };

  const handleReset = () => setSeq([]);

  return (
    <Dialog open={isOpened}
            onClose={onClose}
    >
      <IconButton onClick={onClose} size='small'
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                  }}
      >
        <CloseIcon/>
      </IconButton>
      <DialogTitle>사원 순서 변경</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1}}>
          <Box sx={{fontSize: 13, color: 'text.secondary'}}>
            항목을 클릭하면 선택 순서대로 맨 위로 올라갑니다.
          </Box>
          <Divider flexItem sx={{mx: 1}}/>
          <Chip size="small" label={`선택: ${seq.length}명`}/>
          <Box flex={1}/>
          <Button onClick={handleReset} size="small" variant="outlined">초기화</Button>
        </Stack>

        <List dense disablePadding>
          {ordered.map((emp) => {
            const id = String(getId(emp));
            const idx = seq.indexOf(id); // -1이면 미선택
            const selectedOrder = idx >= 0 ? idx + 1 : null;

            return (
              <ListItemButton
                key={id}
                onClick={() => toggle(emp)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                }}
                selected={idx >= 0}
              >
                <Box display="flex" alignItems="center" flex={1} gap={1}>
                  <Box>{getName(emp)}</Box>
                  {emp.info.position && (
                    <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      {emp.info.position}
                    </Box>
                  )}
                </Box>
                {selectedOrder && (
                  <Chip
                    size="small"
                    label={selectedOrder}
                    sx={{ ml: 1, minWidth: 32, justifyContent: 'center' }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
          <Button onClick={onClose} color='error' variant='outlined'>
            취소
          </Button>
          <Button onClick={handleApply} variant="outlined">
            적용
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}

export default AssignEmployees;