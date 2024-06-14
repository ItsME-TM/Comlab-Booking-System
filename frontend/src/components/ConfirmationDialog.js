import React from 'react';
import '../components/confirmDialog.css';

function ConfirmationDialog({ onConfirm, onCancel }) {
  return (
    <div className="confirmation-dialog">
      <div className="dialog-content">
        <h3>Do you want to remove "L001" User?</h3>
        <div className="dialog-buttons">
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
