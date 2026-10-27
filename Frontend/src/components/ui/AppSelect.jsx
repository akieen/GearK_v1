import React from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const AppSelect = ({
  label,
  topLabel,
  value,
  onChange,
  options = [],
  children,
  required = false,
  fullWidth = true,
  size = 'small',
  error,
  helperText,
  sx = {},
  ...props
}) => {
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
      <FormControl fullWidth={fullWidth} size={size} error={Boolean(error)}>
        {label && !topLabel && <InputLabel>{label}</InputLabel>}
        <Select
          label={label && !topLabel ? label : undefined}
          value={value}
          onChange={onChange}
          sx={{
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
            fontSize: '0.875rem',
            ...sx,
          }}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))
            : children}
        </Select>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </Box>
  );
};

export default AppSelect;
