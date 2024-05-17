import json
import math
import requests
from shapely.geometry import shape, Polygon, MultiLineString

api_key = '5b3ce3597851110001cf6248f4c2894628b444238faa26e91c70c3f3'

def count_short_geometries(geojson_file):
    with open(geojson_file, 'r') as file:
        geojson = json.load(file)
    
    short_geometries_count = 0
    points = 0 
    lines = 0 
    polygons = 0

    # Iterate through each feature in the GeoJSON file
    for feature in geojson['features']:
        geometry = feature['geometry']
        coordinates = geometry['coordinates']

        # Check the type of geometry and count accordingly
        if geometry['type'] == 'Point':
            points += 1
            # Points always have a single coordinate pair
            if len(coordinates) < 3:
                short_geometries_count += 1
        elif geometry['type'] == 'LineString':
            lines += 1
            # Linestrings are lists of coordinate pairs
            for coord in coordinates:
                if len(coord) < 3:
                    short_geometries_count += 1
                    break  # Only count once per geometry
        elif geometry['type'] == 'Polygon':
            polygons += 1
            # Polygons are lists of lists of coordinate pairs (one list per ring)
            for ring in coordinates:
                for coord in ring:
                    if len(coord) < 3:
                        #print(coord)
                        short_geometries_count += 1
                        break  # Only count once per geometry
                if short_geometries_count:  # If already counted, skip other rings
                    break

    print("points", points) 
    print("lines", lines)
    print("polygons", polygons)

    return short_geometries_count

def remove_points_and_linestrings(input_file, output_file):
    with open(input_file, 'r') as file:
        geojson = json.load(file)

    # Modify the features list to exclude Point and LineString geometries
    filtered_features = [feature for feature in geojson['features']
                         if feature['geometry']['type'] not in ['Point', 'LineString']]

    # Update the features in the original GeoJSON data
    geojson['features'] = filtered_features

    # Write the modified GeoJSON to a new file
    with open(output_file, 'w') as file:
        json.dump(geojson, file, indent=4)

def add_centroid_to_geometries(input_file, output_file):
    with open(input_file, 'r') as file:
        geojson = json.load(file)

    for feature in geojson['features']:
        geometry = feature['geometry']
        # Create a Shapely geometry from the GeoJSON geometry
        shapely_geom = shape(geometry)
        # Calculate the centroid of the geometry
        centroid = shapely_geom.centroid
        # Add the centroid coordinates as a custom property in the geometry
        geometry['centroid'] = [centroid.x, centroid.y]

    # Write the modified GeoJSON to a new file
    with open(output_file, 'w') as file:
        json.dump(geojson, file, indent=4)

def add_elevation(geometry):

    url = "https://api.openrouteservice.org/elevation/line"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': api_key
    }
    data = {
        "format_in": "polyline",
        "format_out": "geojson",
        "geometry": geometry
    }
    
    response = requests.post(url, json=data, headers=headers)

    return response.json()

def add_elevation_to_centroid(input_file, output_file): 
    with open(input_file, 'r') as file:
        geojson = json.load(file)

    coordinates = []

    for feature in geojson['features']:
        geometry = feature['geometry']
        centroid = geometry['centroid']

        coordinates.append(centroid)
     
    coordinates = add_elevation(coordinates)

    print("res", coordinates)

    # for index, feature in geojson['features']:
    #     geometry = feature['geometry']
    #     geometry['centroid']

    #     # temp.append(centroid); 


    # Write the modified GeoJSON to a new file
    with open(output_file, 'w') as file:
        json.dump(coordinates, file, indent=4)

def transfer_elevation_data(input_file, output_file): 
    with open(input_file, 'r') as file:
        input_geojson = json.load(file)

    with open(output_file, 'r') as file: 
        output_geojson = json.load(file)

    # Access the coordinates in the geometry
    coordinates = input_geojson['geometry']['coordinates']

    print(len(coordinates),len(output_geojson['features']))

    for index, feature in enumerate(output_geojson['features']):
        feature['geometry']['centroid'] = coordinates[index]

    # Write the modified GeoJSON to a new file
    with open(output_file, 'w') as file:
        json.dump(output_geojson, file, indent=4)
 
def count_coordinates(geojson_file):
    # Load the GeoJSON file
    with open(geojson_file, 'r') as file:
        data = json.load(file)
    
    total_coordinates = 0
    
    # Iterate through each feature in the GeoJSON file
    for feature in data['features']:
        geometry = feature['geometry']
        if geometry['type'] == 'LineString':
            # Count coordinates in a LineString
            total_coordinates += len(geometry['coordinates'])
        elif geometry['type'] == 'MultiLineString':
            # Count coordinates in each LineString of a MultiLineString
            for line in geometry['coordinates']:
                total_coordinates += len(line)

    return total_coordinates

def count_coordinates_by_highway(geojson_file, highway_type):
    # Load the GeoJSON file
    with open(geojson_file, 'r') as file:
        data = json.load(file)

    total_coordinates = 0
    
    # Iterate through each feature in the GeoJSON file
    for feature in data['features']:
        # Check if the feature is of the specified highway type
        if feature['properties'].get('highway') == highway_type:
            geometry = feature['geometry']
            if geometry['type'] == 'LineString':
                # Count coordinates in a LineString
                print(geometry['coordinates'])
                total_coordinates += len(geometry['coordinates'])
            elif geometry['type'] == 'MultiLineString':
                # Count coordinates in each LineString of a MultiLineString
                for line in geometry['coordinates']:
                    total_coordinates += len(line)
            elif geometry['type'] == 'Polygon':
                for ring in geometry['coordinates']:
                    total_coordinates += len(ring)

    return total_coordinates

def api_call(coords): 

    # do api call 
    url = "https://api.openrouteservice.org/elevation/line"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': api_key
    }
    data = {
        "format_in": "polyline",
        "format_out": "geojson",
        "geometry": coords
    }
    
    response = requests.post(url, json=data, headers=headers)
    # print("res", response.json())

    response = response.json()
    return response['geometry']['coordinates']

def process_1(old_coordinates):
    new_coordinates = []
    num_chunks = math.ceil(len(old_coordinates) / 2000)

    for i in range(num_chunks):
        # Slice the coordinates into chunks of 2000
        chunk = old_coordinates[i*2000:(i+1)*2000]
        print(f"Making an API call with {len(chunk)} data items.")
        api_response = api_call(chunk)
        new_coordinates.extend(api_response)
        
        print("Added new data, total data processed so far:", len(new_coordinates))

    print("Total new coordinates:", len(new_coordinates))
    return new_coordinates
        
def add_elevation_to_highway(geojson_file, highway_type): 

    with open(geojson_file, 'r') as file:
        input_geojson = json.load(file)

    old_coordinates = []
    for feature in input_geojson['features']:
        if feature['properties'].get('highway') == highway_type:
            geometry = feature['geometry']
            if geometry['type'] == 'LineString':
                old_coordinates.extend(geometry['coordinates'])
            elif geometry['type'] == 'MultiLineString':
                for line in geometry['coordinates']:
                    old_coordinates.extend(line)
            elif geometry['type'] == 'Polygon':
                for ring in geometry['coordinates']:
                    old_coordinates.extend(ring)

    print("old_coords", len(old_coordinates))
    
    new_coordinates = process_1(old_coordinates)

    print("new_coordinates", new_coordinates)

    index = 0
    # Check if the lengths match
    if len(new_coordinates) == len(old_coordinates):
        for feature in input_geojson['features']:
            if feature['properties'].get('highway') == highway_type:
                geometry = feature['geometry']
                if geometry['type'] == 'LineString':
                    for i in range(len(geometry['coordinates'])):
                        geometry['coordinates'][i] = new_coordinates[index]
                        index += 1
                elif geometry['type'] == 'MultiLineString':
                    for line in geometry['coordinates']:
                        for i in range(len(line)):
                            line[i] = new_coordinates[index]
                            index += 1
                elif geometry['type'] == 'Polygon':
                    for ring in geometry['coordinates']:
                        for i in range(len(ring)):
                            ring[i] = new_coordinates[index]
                            index += 1
        
        # print("input_geojson", input_geojson)
            # Write the modified GeoJSON to a new file
        with open('dumpfile.geojson', 'w') as file:
            json.dump(input_geojson, file, indent=4)

    

# Example usage for count_short...
# geojson_file = 'UCSC_Buildings_V2.geojson'
# result = count_short_geometries(geojson_file)
# print(f'Number of geometries with coordinate length less than 3: {result}')

# Example usage for remove_points...
# input_file = 'buildings.geojson'
# output_file = 'UCSC_Buildings_V2.geojson'
# remove_points_and_linestrings(input_file, output_file)

# Example usage add_centroid...
# input_file = 'UCSC_Buildings_V2.geojson'
# output_file = 'UCSC_Buildings_V3.geojson'
# add_centroid_to_geometries(input_file, output_file)

# Example usage add_elevation...
# input_file = 'UCSC_Buildings_V3.geojson'
# output_file = 'elevation.geojson'
# add_elevation_to_centroid(input_file, output_file)

# Example usage 
# input_file = 'elevation.geojson'
# output_file = 'UCSC_Buildings_V3.geojson'
# transfer_elevation_data(input_file, output_file)

# Example usage
# file_path = 'path.geojson'
# print(f"Total coordinates: {count_coordinates(file_path)}")

# Example usage
# file_path = 'path.geojson'
# highway_type = 'path'  # Specify the type of highway you want to count
# print(f"Total coordinates for {highway_type} highways: {count_coordinates_by_highway(file_path, highway_type)}")

# Example usage
file_path = 'path.geojson'
highway_type = 'path'  # Specify the type of highway you are interested in
add_elevation_to_highway(file_path, highway_type)

