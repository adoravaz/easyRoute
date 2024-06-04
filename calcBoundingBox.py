
import numpy as np
from PIL import Image
import math


def lat_lng_to_pixel(lat, lng, zoom):
    # Converts latitude and longitude to pixel coordinates in the given zoom level
    siny = math.sin(lat * math.pi / 180)
    siny = min(max(siny, -0.9999), 0.9999)
    x = 256 * (0.5 + lng / 360)
    y = 256 * (0.5 - math.log((1 + siny) / (1 - siny)) / (4 * math.pi))
    scale = 2 ** zoom
    return int(x * scale), int(y * scale)

def pixel_to_lat_lng(x, y, zoom):
    # Converts pixel coordinates to latitude and longitude in the given zoom level
    scale = 2 ** zoom
    lng = x / scale / 256 * 360 - 180
    n = math.pi - 2 * math.pi * y / scale / 256
    lat = 180 / math.pi * math.atan(0.5 * (math.exp(n) - math.exp(-n)))
    return lat, lng

def calculate_bounding_box(center_lat, center_lng, zoom, image_width, image_height):
    center_x, center_y = lat_lng_to_pixel(center_lat, center_lng, zoom)
    
    half_width = image_width / 2
    half_height = image_height / 2
    
    bottom_left_x = center_x - half_width
    bottom_left_y = center_y + half_height
    
    top_right_x = center_x + half_width
    top_right_y = center_y - half_height
    
    bottom_left_lat, bottom_left_lng = pixel_to_lat_lng(bottom_left_x, bottom_left_y, zoom)
    top_right_lat, top_right_lng = pixel_to_lat_lng(top_right_x, top_right_y, zoom)
    
    return (bottom_left_lat, bottom_left_lng), (top_right_lat, top_right_lng)

# const center = [-122.0583, 36.9916, 36.9941766]
# Example usage
center_lat = 36.9916  # Center latitude of the image
center_lng = -122.0583  # Center longitude of the image
zoom = 15  # Zoom level
image_width = 1280  # Image width in pixels
image_height = 1280  # Image height in pixels

bottom_left, top_right = calculate_bounding_box(center_lat, center_lng, zoom, image_width, image_height)
print("Bottom Left:", bottom_left)
print("Top Right:", top_right)
# This proves that the alorithm is correct because we can get the same center points. 
print("Center Point:", bottom_left[0]+(top_right[0]-bottom_left[0])/2, bottom_left[1]+(top_right[1]-bottom_left[1])/2) 
