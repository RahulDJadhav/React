
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import styles from './TaskOptions.module.css';


const TaskOptions = ({ onEdit, onDelete }) => {
  const [show, setShow] = useState(false);
  const boxRef = useRef(null);

  // Close if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={boxRef}>
      <div className='cursor-pointer' onClick={() => setShow((prev) => !prev)} >
        <FontAwesomeIcon icon={faEllipsisH} />
      </div>

      {show && (
        <div className={`position-absolute bg-white border shadow-sm rounded ${styles.dropdownItemDiv} `}>
          {/* <div className={`dropdown-item d-flex ${styles.actionBtn}`} onClick={onDone} >
            <FontAwesomeIcon icon={faCheck} className="me-2 mt-1" /> Done
          </div> */}
          <div className={`dropdown-item d-flex ${styles.actionBtn}`} onClick={onEdit} >
            <FontAwesomeIcon icon={faEdit} className="me-2 mt-1" /> Edit
          </div>
          <div className={`dropdown-item d-flex  ${styles.actionBtn}`} onClick={onDelete} >
            <FontAwesomeIcon icon={faTrash} className="me-2 mt-1" /> Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskOptions;
