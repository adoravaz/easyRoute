import React from 'react';

const DirectionsList = ({directions}) => {
    <div>
        <h3>Directions</h3>
        <ul>
        {directions.map((direction, index) => (
            <li key={index}>
            {direction.instruction} ({direction.distance.toFixed(2)}m, {Math.round(direction.duration)}s)
            </li>
        ))}
        </ul>
    </div>
};

export default DirectionsList;
