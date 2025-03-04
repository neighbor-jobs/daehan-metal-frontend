import React, { useState } from "react";
import {Box} from "@mui/material";
import {LocalizationProvider, DesktopDatePicker,} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";

interface DateRangePickerProps {
  onChange: (startDate: Dayjs | null, endDate: Dayjs | null) => void;
}

const DateRangePicker = ({ onChange }: DateRangePickerProps): React.JSX.Element => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

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
          onChange={handleStartDateChange}
          slotProps={{
            textField: {size: 'small'},
            calendarHeader: {format: 'YYYY/MM'},
          }}
        />
        <p>-</p>
        <DesktopDatePicker
          value={endDate}
          views={['day']}
          format="YYYY/MM/DD"
          onChange={handleEndDateChange}
          minDate={startDate || undefined}
          slotProps={{
            textField: {size: 'small'},
            calendarHeader: {format: 'YYYY/MM' },
        }}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker;