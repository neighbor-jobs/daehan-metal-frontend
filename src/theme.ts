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
          height: 250,
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
          height: 250,
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
          fontSize: '0.8rem',
        }
      }
    },
    MuiMonthCalendar: {
      styleOverrides: {
        root: {
          width: '100%',
          padding: 0,
          margin: 1,
        },
        monthButton: {
          fontSize: '0.8rem',
          padding: 0,
          margin: 0,
        }
      }
    },
    MuiPickersYear: {
      styleOverrides: {
        root: {
          width: '100%',
          padding: 0,
          margin: 0,
        },
        yearButton: {
          fontSize: '0.8rem',
          padding: 0,
          margin: 0,
          width: 50,
        }
      }
    },
    MuiYearCalendar: {
      styleOverrides: {
        root: {
          width: 215,
          padding: 0,
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