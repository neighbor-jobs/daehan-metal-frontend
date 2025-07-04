import React, {RefObject, useState} from "react";
import {Box} from "@mui/material";
import {DesktopDatePicker, LocalizationProvider,} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {Dayjs} from "dayjs";

interface DateRangePickerProps {
  startAt?: Dayjs | null;
  endAt?: Dayjs | null;
  startInputRef?: RefObject<HTMLInputElement>;
  endInputRef?: RefObject<HTMLInputElement>;
  onChange: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
  onStartKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onEndKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const DateRangePicker = ({
                           onChange,
                           startAt,
                           endAt,
                           startInputRef,
                           endInputRef,
                           onStartKeyDown,
                           onEndKeyDown,
                         }: DateRangePickerProps): React.JSX.Element => {
  const [startDate, setStartDate] = useState<Dayjs | null>(startAt);
  const [endDate, setEndDate] = useState<Dayjs | null>(endAt);

  const handleStartDateChange = (newDate: Dayjs | null) => {
    setStartDate(newDate);
    if (newDate && endDate && newDate.isAfter(endDate)) {
      setEndDate(null);
    }
    onChange(newDate, endDate);
  };

  const handleEndDateChange = (newDate: Dayjs | null) => {
    setEndDate(newDate);
    onChange(startDate, newDate);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}>
        <DesktopDatePicker
          value={startDate}
          views={['day']}
          format="YYYY/MM/DD"
          inputRef={startInputRef || undefined}
          onChange={handleStartDateChange}
          slotProps={{
            textField: {
              size: 'small',
              onKeyDown: onStartKeyDown || undefined,
            },
            calendarHeader: {format: 'YYYY/MM'},
          }}
        />
        <p>-</p>
        <DesktopDatePicker
          value={endDate}
          views={['day']}
          format="YYYY/MM/DD"
          inputRef={endInputRef || undefined}
          onChange={handleEndDateChange}
          minDate={startDate || undefined}
          slotProps={{
            textField: {
              size: 'small',
              onKeyDown: onEndKeyDown || undefined,
            },
            calendarHeader: {format: 'YYYY/MM'},
          }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;