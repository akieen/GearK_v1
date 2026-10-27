import React from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const AppInput = React.forwardRef(function AppInput(
  {
    label,
    topLabel,
    placeholder,
    startAdornment,
    endAdornment,
    error,
    helperText,
    required = false,
    fullWidth = true,
    size = 'small',
    sx = {},
    InputProps = {},
    ...props
  },
  ref
) {
  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', mb: topLabel ? 1.5 : 0 }}>
      {topLabel && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 700,
            color: 'text.secondary',
            mb: 0.75,
          }}
        >
          {topLabel} {required && <span style={{ color: '#E30019' }}>*</span>}
        </Typography>
      )}
      <TextField
        ref={ref}
        label={!topLabel ? label : undefined}
        placeholder={placeholder}
        error={Boolean(error)}
        helperText={helperText}
        required={required}
        fullWidth={fullWidth}
        size={size}
        InputProps={{
          startAdornment: startAdornment ? (
            <InputAdornment position="start">{startAdornment}</InputAdornment>
          ) : undefined,
          endAdornment: endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : undefined,
          ...InputProps,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
            fontSize: '0.875rem',
          },
          ...sx,
        }}
        {...props}
      />
    </Box>
  );
});

export default AppInput;
