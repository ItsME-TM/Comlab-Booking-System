import React from 'react';
import './ConfirmationDialog.css';

function ConfirmationDialog({
  onConfirm,
  onCancel,
  message = 'Do you want to remove "L001" User?',
}) {
  return (
    <div className='confirmation-dialog'>
      <div className='dialog-content'>
        <h3>{message}</h3>
        <div className='dialog-buttons'>
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
