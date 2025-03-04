import {createTheme} from '@mui/material/styles';
const theme = createTheme({
  components: {
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.8rem',
        },
      },
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          width: 210,
          height: 230,
        }
      }
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          margin: 0,
          padding: 0,
        },
        label: {
          fontSize: '0.8rem',
          marginLeft: 10,
        },
        switchViewButton: {
          padding: 0,
          margin: 0,
        },
      }
    },
    MuiPickersPopper: {
      styleOverrides: {
        paper: {
          width: 210,
          height: 230,
        }
      }
    },
    MuiDayCalendar: {
      styleOverrides: {
        root: {
          margin: 0,
          padding: 0,
        },
        weekDayLabel: {
          padding: 0,
          margin: 0,
          width: 210,
          height: 30,
        },
        weekContainer: {
          padding: 0,
          margin: 0,
        }
      }
    },
    MuiPickersDay: {
      styleOverrides: {
        root: {
          height: 30,
          width: 210,
          borderRadius: 5,
        },
        today: {
          borderRadius: 5,
        }
      }
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        root: {
          margin: 0,
          padding: 0,
        }
      }
    },
    MuiPickersMonth: {
      styleOverrides: {
        root: {
          width: 70,
          padding: 0,
          margin: 0,
        },
        monthButton: {
          padding: 0,
          margin: 0,
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 170,
        }
      }
    }
  },
});

export default theme;