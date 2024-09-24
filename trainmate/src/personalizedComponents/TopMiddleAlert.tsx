import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { SnackbarCloseReason } from '@mui/material';

interface TopMiddleAlertProps {
    alertText: string;
  }

export default function TopMiddleAlert({ alertText }: TopMiddleAlertProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    showAlert()
  }, []);

  const showAlert = () => {
    setOpen(true);

    setTimeout(() => {
      setOpen(false);
    }, 3000);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {alertText}
        </Alert>
      </Snackbar>
    </div>
  );
}