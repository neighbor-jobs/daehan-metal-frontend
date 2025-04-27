import {Box, InputLabel, OutlinedInput, OutlinedInputProps} from '@mui/material';

interface InputWithLabelProps extends OutlinedInputProps {
  label: string;
  labelPosition: 'left' | 'top';
  textAlign?: 'right' | 'left';
}

const InputWithLabel = ({
                          label,
                          labelPosition,
                          textAlign = 'right',
                          inputProps,
                          ...outlinedInputProps
                        }: InputWithLabelProps): React.JSX.Element => {

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
        {...outlinedInputProps}
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
          ...(inputProps || {}),
          sx: {textAlign: textAlign}, // sx도 덮어쓰기
        }}
      ></OutlinedInput>
    </Box>
  )
}

export default InputWithLabel;