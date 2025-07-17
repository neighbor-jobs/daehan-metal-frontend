import dayjs from 'dayjs';

const calcAge = (birth: string): string => {
  if (!birth || birth.length < 4) return '';
  const today = dayjs();
  const birthDate = dayjs(birth, 'YYYY-MM-DD');
  if (!birthDate.isValid()) return '';
  return (today.year() - birthDate.year() + 1).toString();
}

export default calcAge;