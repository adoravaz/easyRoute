import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import './DirectionsList.css'

const DirectionsList = ({directions, routeTotal}) => {
    const theme = createTheme({
        typography: {
            fontFamily: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'].join(','),
        },
    });

    return (
        <>
        {directions.length !== 0 ?
            <ThemeProvider theme={theme}>
            <Grid item xs={12} md={6} className="directions-container">
                <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
                    Directions
                </Typography>
                <Typography sx={{ mt: 4, mb: 2 }} variant="h8" component="div">
                    Total: {routeTotal.distance.toFixed(2)}m, {Math.round(routeTotal.duration)}s
                </Typography>
                <List>
                {directions.map((direction, index) => (
                    <ListItem key={index} >
                        <ListItemText
                            primary={direction.instruction}
                            secondary={`${direction.distance.toFixed(2)}m, ${Math.round(direction.duration)}s`}
                        />
                    </ListItem>
                ))}
                </List>
            </Grid>
            </ThemeProvider>
            :
            <></>
        }
        </>
    );
};

export default DirectionsList;
