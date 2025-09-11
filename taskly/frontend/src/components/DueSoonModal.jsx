import React from 'react';

const DueSoonModal = ({ tasks, onClose }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop show"></div>

      {/* Modal (no Bootstrap JS, purely styled) */}
      <div className="modal d-block" tabIndex="-1" aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Upcoming due tasks</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <ul className="list-group">
                {tasks.map((t) => {
                  const due = new Date(t.due_date);
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const dueCopy = new Date(due); dueCopy.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil((dueCopy - today) / (1000 * 60 * 60 * 24));
                  const label = diffDays === 0 ? 'Due today' : diffDays === 1 ? 'Due tomorrow' : '';
                  return (
                    <li key={t.id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div className="ms-2 me-auto">
                        <div className="fw-semibold">{t.title}</div>
                        <small className="text-muted">{label} • {t.due_date}</small>
                      </div>
                      <span className={`badge ${diffDays < 0 ? 'bg-danger' : 'bg-warning text-dark'} rounded-pill`}>
                        {diffDays < 0 ? `Overdue ${Math.abs(diffDays)}d` : label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Dismiss</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DueSoonModal; 