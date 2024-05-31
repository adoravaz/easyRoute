import requests
from PIL import Image
import io

# Replace 'your_google_maps_api_key' with your actual Google Maps API key
API_KEY = 'AIzaSyCAXMTnTOhBoFrgG75ew6OzU0O3LBccHUQ'
# Custom rectangle coordinates (south latitude, west longitude, north latitude, east longitude)
south_lat = 36.9870
west_lng = -122.0640
north_lat = 36.9960
east_lng = -122.0520
# Zoom level for the map
zoom = 15
# Logical size of each tile in pixels (maximum 640x640)
tile_size = 640
# Scale parameter to increase resolution
scale = 1
# Map type (roadmap, satellite, hybrid, terrain)
map_type = 'roadmap'
# Style to hide text labels
style = 'feature:all|element:labels|visibility:off'

def get_tile_url(lat, lng, zoom, tile_size, map_type, style, scale, api_key):
    return f"https://maps.googleapis.com/maps/api/staticmap?center={lat},{lng}&zoom={zoom}&size={tile_size}x{tile_size}&scale={scale}&maptype={map_type}&style={style}&key={api_key}"

def fetch_tile(url):
    response = requests.get(url)
    if response.status_code == 200:
        return Image.open(io.BytesIO(response.content))
    else:
        raise Exception(f"Failed to fetch tile: {response.status_code}, {response.text}")

def calculate_lat_lng_steps(south_lat, west_lng, north_lat, east_lng, zoom, tile_size, scale):
    lat_step = (north_lat - south_lat) / 2
    lng_step = (east_lng - west_lng) / 2
    return lat_step, lng_step

def stitch_tiles(tiles, tile_size, scale):
    tile_px_size = tile_size * scale
    stitched_image = Image.new('RGB', (tile_px_size * 2, tile_px_size * 2))
    for i, tile in enumerate(tiles):
        x = (i % 2) * tile_px_size
        y = (i // 2) * tile_px_size
        stitched_image.paste(tile, (x, y))
    return stitched_image

def main():
    lat_step, lng_step = calculate_lat_lng_steps(south_lat, west_lng, north_lat, east_lng, zoom, tile_size, scale)
    latitudes = [south_lat + lat_step, south_lat + lat_step, north_lat - lat_step, north_lat - lat_step]
    longitudes = [west_lng + lng_step, east_lng - lng_step, west_lng + lng_step, east_lng - lng_step]

    tiles = []
    for lat, lng in zip(latitudes, longitudes):
        url = get_tile_url(lat, lng, zoom, tile_size, map_type, style, scale, API_KEY)
        tile = fetch_tile(url)
        tiles.append(tile)

    if len(tiles) == 4:
        stitched_image = stitch_tiles(tiles, tile_size, scale)
        stitched_image.save('ucsc_google_map_2.png')
        print("High resolution map image downloaded successfully as 'ucsc_google_map.png'")
    else:
        print("Failed to fetch all tiles. High resolution map image not created.")

if __name__ == "__main__":
    main()
