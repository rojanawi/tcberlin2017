from Server import app
from flask import Flask, flash, render_template, url_for, request, redirect, session, jsonify
import os
from datetime import datetime
import googlemaps
#from arcgis import GIS
#from arcgis.features import Feature
#from arcgis.features import FeatureSet
#import arcgis.network as network
from ast import literal_eval
from pprint import pprint 
gmaps = googlemaps.Client(key='KEYKEYKEYKEYKEY')

@app.route('/calculate', methods=['POST', 'GET'])
def generate_tuples():
	latitude=float(request.args.get('latitude'))
	longitude=float(request.args.get('longitude'))
	centerTuple=(latitude,longitude)
	step=0.01
	gridSize=(-2,2)
	Matrix = [(centerTuple[0]+i*step,centerTuple[1]+j*step) for i in range(gridSize[0], gridSize[1]) for j in range(gridSize[0],gridSize[1])]
	distance_matrix=gmaps.distance_matrix(centerTuple, Matrix, mode=request.args.get('transportation_mode'))
	Matrix = {'Coordinates': Matrix}
	return jsonify(Matrix, distance_matrix)


#@app.route('/arcgis_sa', methods=['POST', 'GET'])
#def use_arcgis():
#	json_graphic=str(request.args.get('graphic'))
#	feat=Feature.from_json(json_graphic)
#	fs=FeatureSet([feat])
#	service_area_url = gis.properties.helperServices.serviceArea.url
#	sa_layer = network.ServiceAreaLayer(service_area_url, gis=gis)
#	travel_modes = sa_layer.retrieve_travel_modes()
#	drive_mode = [t for t in travel_modes['supportedTravelModes'] if t['name'] == 'Driving Time'][0]
#	result = sa_layer.solve_service_area(fs, default_breaks=[5,10,15], travel_direction='esriNATravelDirectionToFacility',travel_mode=drive_mode)
#	return jsonify(result)


@app.route('/calculate_multiple', methods=['POST'])
def calculate_multiple_tuples():
	parameters = request.get_json()

	lat = 0.0
	lng = 0.0

	coords = parameters['coords']
	transportationMode = parameters['transportationMode']

	origins = []

	minLat = coords[0]['latitude']
	maxLat = coords[0]['latitude']
	minLng = coords[0]['longitude']
	maxLng = coords[0]['longitude']

	for latlng in coords:
		lat += latlng['latitude']
		lng += latlng['longitude']
		origins.append( (latlng['latitude'], latlng['longitude']) )
		minLat = latlng['latitude'] if latlng['latitude'] < minLat else minLat
		maxLat = latlng['latitude'] if latlng['latitude'] > maxLat else maxLat
		minLng = latlng['longitude'] if latlng['longitude'] < minLng else minLng
		maxLng = latlng['longitude'] if latlng['longitude'] > maxLng else maxLng

	horizontal_distance = abs(maxLat-minLat)*1.2
	vertical_distance = abs(maxLng-minLng)*1.2

	max_distance = max(horizontal_distance, vertical_distance)

	gridSize=(-1,1)

	nb_steps = gridSize[1]-gridSize[0]
	step = max_distance / nb_steps

	lat = lat / len(coords)
	lng = lng / len(coords)

	centerTuple = (lat, lng)

	pprint(max_distance)
	pprint(gridSize)
	pprint(minLat)
	pprint(minLng)
	pprint(maxLat)
	pprint(maxLng)
	pprint(step)


	# step=0.01
	Matrix = [(centerTuple[0]+i*step,centerTuple[1]+j*step) for i in range(gridSize[0], gridSize[1] +1 ) for j in range(gridSize[0],gridSize[1] + 1)]

	center = {'lat': lat, 'lng': lng}

	#distance_matrix = center
	distance_matrix=gmaps.distance_matrix(origins, Matrix, mode=transportationMode)

	ret = {
		'coordinates': Matrix,
		'center': center,
		'stepSize': step,
		'distanceMatrix': distance_matrix,
	}
	return jsonify(ret)
