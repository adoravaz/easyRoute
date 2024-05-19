import React, {useState, useEffect} from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import './AvoidStairsSwitch.css';

const AvoidStairsSwitch = ({onToggle}) => {
  const [avoidStairs, setAvoidStairs] = useState(false);
  
  const handleToggle = () => {
    const newValue = !avoidStairs;
    setAvoidStairs(newValue);
    if (onToggle) {
      onToggle(newValue);
    }
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(avoidStairs);
    }
  }, [avoidStairs, onToggle]);

  return (
    <FormGroup className="avoidStairs-container">
      <FormControlLabel 
        control={
          <Switch checked={avoidStairs} onChange={handleToggle} name="avoidStairs" />
        }
        label="Avoid stairs" />
    </FormGroup>
  );
};

export default AvoidStairsSwitch;