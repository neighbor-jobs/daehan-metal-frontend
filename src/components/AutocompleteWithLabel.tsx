import {Autocomplete, Box, InputLabel, TextField} from '@mui/material';

interface AutocompleteWithTopLabelProps {
  labelPosition: 'left' | 'top';
  label: string;
  items: string[];
  onChange?: (value: string) => void;
}

const AutocompleteWithLabel = ({
                                    label,
                                    items,
                                    labelPosition,
                                    onChange
}: AutocompleteWithTopLabelProps):React.JSX.Element => {
  return (
    <Box sx={{
        display: 'flex',
        flexDirection: labelPosition === 'top' ? 'column' : 'row',
        alignItems: labelPosition === 'top' ? '' : 'center',
      }}
    >
      <InputLabel sx={{
        fontSize: 'small',
        width: labelPosition === 'left' ? '20%' : '100%',
      }}>
        {label}
      </InputLabel>
      <Autocomplete
        freeSolo
        options={items.map((option) => option)}
        onChange={(_, newValue) => {
          if (onChange) onChange(newValue || '');
        }}
        renderInput={(params) =>
          <TextField {...params}
                     size='small'
                     sx={{minWidth: 150}}
          />
        }
      />
    </Box>
  )
}

export default AutocompleteWithLabel;