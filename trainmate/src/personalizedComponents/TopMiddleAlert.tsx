import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface TopMiddleAlertProps {
  alertText: string;
  open: boolean;
  onClose: () => void;
}

export default function TopMiddleAlert({ alertText, open, onClose }: TopMiddleAlertProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity="success" sx={{ width: '100%' }}>
        {alertText}
      </Alert>
    </Snackbar>
  );
}