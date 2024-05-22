import json

f = open("UCSC_Highways_V7.geojson")
data = json.load(f)

def find_coords(coords):
    if type(coords) is not list:
        return []
    if type(coords[0]) is list and type(coords[0][0]) is float:
        return coords
    else:
        result = []
        for i in coords:
            result += find_coords(i)
        return result

newdata = {}
for feature in data["features"]:
    coords = feature["geometry"]["coordinates"]
    for point in find_coords(coords):
        print(point)
        newdata[f"{str(point[0])} {str(point[1])}"] = point[2]

with open("elevations.json", "w") as outfile:
    json.dump(newdata, outfile)
