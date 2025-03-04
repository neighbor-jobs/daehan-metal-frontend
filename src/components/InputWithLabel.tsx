import {Box, InputLabel, OutlinedInput} from '@mui/material';

interface InputWithLabelProps {
  label: string;
  labelPosition: 'left' | 'top';
  textAlign?: 'right' | 'left';
}

const InputWithLabel = ({label, labelPosition, textAlign = 'right'}: InputWithLabelProps):React.JSX.Element => {

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: labelPosition === 'top' ? 'column' : 'row',
        alignItems: 'center',
      }}
    >
      <InputLabel sx={{fontSize: 'small', width: '25%', minWidth: 60}}>{label}</InputLabel>
      <OutlinedInput
        type="number"
        size='small'
        fullWidth
        sx={{
          '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]': {
            MozAppearance: 'textfield',
          }
        }}
        inputProps={{
          sx: { textAlign: `${textAlign}` }
      }}
      ></OutlinedInput>
    </Box>
  )
}

export default InputWithLabel;