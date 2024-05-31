from PIL import Image
import numpy as np
import json
import requests

ors_api_key = '5b3ce3597851110001cf6248f4c2894628b444238faa26e91c70c3f3'

google_elevation_api_key = 'AIzaSyCuVNR6qGU3cwMvfYZzfPSwxYHFZNYAdJQ'

center  = [36.9916,-122.0583, 182]
bottom_left = [36.9696, -122.0857]
top_right = [37.0135, -122.0308]
difference = [
    top_right[0]-bottom_left[0], 
    top_right[1]-bottom_left[1],
]

def ors_api_call(geometry):

    url = "https://api.openrouteservice.org/elevation/line"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': ors_api_key
    }
    data = {
        "format_in": "polyline",
        "format_out": "geojson",
        "geometry": geometry
    }
    
    response = requests.post(url, json=data, headers=headers)

    # Check if the response status is OK
    if response.status_code == 200:
        response_json = response.json()
        print("Response:", response_json)
        return response_json['geometry']['coordinates']
    else:
        # Handle error responses
        print("Error:", response.status_code, response.text)
        return []

def google_api_call(coords):
    # Prepare the coordinates for the Google Elevation API
    locations = '|'.join([f"{lat},{lng}" for lat, lng in coords])
    
    # Do API call
    url = f"https://maps.googleapis.com/maps/api/elevation/json?locations={locations}&key={google_elevation_api_key}"

    response = requests.get(url)
    
    # Check if the response status is OK
    if response.status_code == 200:
        response_json = response.json()
        if response_json['status'] == 'OK':
            # Extract elevation data
            elevations = [(result['location']['lat'], result['location']['lng'], result['elevation']) for result in response_json['results']]
            return elevations
        else:
            print("API Error Message:", response_json['status'])
            return []
    else:
        # Handle error responses
        print("Error:", response.status_code, response.text)
        return []

def apply_color(image, x, y, chunk_size, color):
    for i in range(chunk_size):
        for j in range(chunk_size):
            if x + j < image.shape[1] and y + i < image.shape[0]:
                image[y + i, x + j] = color

def getMinAndMax(grid): 
    min = max = center[2] 

    # assuming that grid is a sqaure 
    for i in range(len(grid)):
        for j in range(len(grid)): 
            if (grid[i][j][2] > max): 
                max = grid[i][j][2] 
            if grid[i][j][2] < min: 
                min = grid[i][j][2]
    return (min, max)

def compute_color(normalized_value):
    # Ensure the normalized value is between 0 and 1
    normalized_value = max(0, min(normalized_value, 1))
    # Compute the color components
    color_component = int((1 - normalized_value) * 255)
    # Return the RGB tuple
    return (color_component, color_component, color_component)

def process_image(input_path, output_path, chunk_size=10):
    image = Image.open(input_path).convert('RGB')
    image_np = np.array(image, dtype=np.uint8)

    size= image_np.shape[0]  # Assuming a square image

    print("res", pow((size/chunk_size), 2))

    points = []

    for y in range(0, size, chunk_size):

        # value to store the array of calcuated coords that raster to the image
        temp = []
        for x in range(0, size, chunk_size):
           temp.append((round(bottom_left[0]+((difference[0])*(x/size)), 6), round(top_right[1]-(difference[1])*(y/size), 6)))

        new_coords = google_api_call(temp)
        print("api_call success res length: ", len(new_coords), end=' '); 
        points.append(new_coords) 
    # get the min and max elevation 

    minValue, maxValue = getMinAndMax(points) 
    print("min and max value", minValue, maxValue)

    i = 0; 
    for y in range(0, size, chunk_size):
        j = 0; 
        for x in range(0, size, chunk_size):
            normalizedPoint = (points[i][j][2]-minValue)/(maxValue-minValue)
            print("normalizedPoint", normalizedPoint, end=' ');  
            apply_color(image_np, x, y, chunk_size, compute_color(normalizedPoint))
            j = j+1 
        i = i + 1
        
    new_image = Image.fromarray(image_np)
    new_image.save(output_path)

if __name__ == "__main__":
    input_image_path = 'ucsc_map_roadmap.png'  # Path to your input image
    output_image_path = 'ucsc_map_dem_v3.png'  # Path to save the processed image
    chunk_size = 5  # Size of the chunks

    process_image(input_image_path, output_image_path, chunk_size)

