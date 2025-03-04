import {Autocomplete, Box, InputLabel, TextField} from '@mui/material';

interface AutocompleteWithTopLabelProps {
  label: string;
  items: string[];
}

const AutocompleteWithTopLabel = ({label, items}: AutocompleteWithTopLabelProps):React.JSX.Element => {
  return (
    <Box>
      <InputLabel sx={{fontSize: 'small',}}>{label}</InputLabel>
      <Autocomplete
        freeSolo
        options={items.map((option) => option)}
        renderInput={(params) =>
          <TextField {...params}
                     size='small'
                     sx={{minWidth: 150}}
                     fullWidth
          />
        }
      />
    </Box>
  )
}

export default AutocompleteWithTopLabel;