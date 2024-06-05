# EasyRoute

## Overview
This project presents an interactive 3D map of the University of California, Santa Cruz (UCSC) campus. The map utilizes GeoJSON data sourced from OpenStreetMap and is rendered using the Three.js library. This interactive tool allows users to click on various campus buildings and obtain routes between them, courtesy of the OpenRoute Service.

EasyRoute aims to help you to find the best path to fit your accessibility needs. We want to help those with disabilities to find the most efficient route, without having to spend extra time searching for a feasible path.  

## Features
- **Interactive 3D Map**: Explore the UCSC campus in three dimensions.
- **Building Information**: Click on any building to see detailed information in the form of a popup.
- **Routing**: Get custom routes between buildings directly on the map using OpenRoute Service. Routes can be customized based on travel profile (driving, cycling, walking, wheelchair, etc.) and to avoid stairs.
- **Color Coding**: Buildings and routes are color-coded for easier identification. Color coding is explained in a legend.

## Using the Map
To use the map, select the buildings using the mouse and clicking on the with the left mouse button, or by searching for desired building(s) in the search, then press Calculate Route. Currently only routes between two buildings work. You can pan around the map using right click, rotate using the left click, and zoom using the mouse wheel.

## Screenshot
Here is a screenshot of the map in action:
![EasyRoute](screenshot.png "Interactive UCSC Campus Map")

## Technical Details
- **GeoJSON Data**: Data is pulled from OpenStreetMap.
- **Rendering Engine**: The map is rendered using Three.js.
- **Map Images**: The map terrain and image is rendered using Mapbox.
- **Routing Service**: Routes are calculated using the OpenRoute Service.

## Installation
Clone the repository to your local machine:
```bash
git clone https://github.com/adoravaz/easyRoute.git
cd your-project-directory
```
Once you have navigated to the project directory on your local machine:
Run
```bash
npm install
```
Before you can run the project, you must ensure you have created API keys for OpenRoute Service and Mapbox, added them to a .env file structured as below, not including the quotation marks.
```
VITE_OPENSTREET_API_KEY="insert OpenRoute Service API key here"
VITE_MAPBOX_API_TOKEN="insert Mapbox API key here"
```
Now you can run the project by entering:
```bash
npm run dev
```
The generated link can be opened on a browser to load and view the project.

