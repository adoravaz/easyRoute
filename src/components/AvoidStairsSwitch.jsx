import React, {useState} from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import './AvoidStairsSwitch.css';

const AvoidStairsSwitch = () => {
  const [avoidStairs, setAvoidStairs] = useState(false);
  
  const handleToggle = () => {
      setAvoidStairs(!avoidStairs);
  }

  return (
    <FormGroup className="avoidStairs-container">
      <FormControlLabel 
        control={
          <Switch checked={avoidStairs} onChange={handleToggle} name="avoidSteps" />
        }
        label="Avoid stairs" />
    </FormGroup>
  );
};

export default AvoidStairsSwitch;