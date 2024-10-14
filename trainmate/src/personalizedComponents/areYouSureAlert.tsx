import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from '@mui/material';

interface AreYouSureAlertProps {
    areYouSureTitle: string;
    areYouSureText: string;
    open: boolean;
    handleCloseAgree: any;
    handleCloseDisagree: any;
    dataToDelete: any;
}

export default function AreYouSureAlert({areYouSureTitle, areYouSureText, open, handleCloseAgree, handleCloseDisagree, dataToDelete}: AreYouSureAlertProps) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleCloseDisagree}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{areYouSureTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {areYouSureText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisagree} color="primary">
            Disagree
          </Button>
          <Button onClick={() => handleCloseAgree(dataToDelete)} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
