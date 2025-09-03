import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const CategoryControls = () => {

  const handleClick = () => {
    alert("Dropdown Clicked!");
  }
  return (
    <div className="row d-flex align-items-center mb-3">

      <div className="col-md-2">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <input type="checkbox" className="form-check-input " />
          </span>
          <span className="input-group-text bg-white">
            <FontAwesomeIcon icon={faCaretDown} onClick={handleClick} />
          </span>
        </div>
      </div>

      <div className="col-md-3">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <FontAwesomeIcon icon={faList} />
          </span>
          <input type="text" className="form-control" placeholder="Order by" />
        </div>
      </div>
      <div className="col-md-2"></div>
    </div>
  );
};

export default CategoryControls;
