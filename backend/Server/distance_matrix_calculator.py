from Server import app
from flask import Flask, flash, render_template, url_for, request, redirect, session, jsonify
import os
from datetime import datetime
import googlemaps
from arcgis import GIS
from arcgis.features import Feature
from arcgis.features import FeatureSet
import arcgis.network as network
from ast import literal_eval

gmaps = googlemaps.Client(key='AIzaSyA2eFpbH0vjcilxHTCx0l0dUYTKqJwwgZ4')
gis = GIS("https://www.arcgis.com", "nirsoffer", "fuckthisshit12")

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

@app.route('/arcgis_sa', methods=['POST', 'GET'])
def use_arcgis():
	json_graphic=str(request.args.get('graphic'))
	feat=Feature.from_json(json_graphic)
	fs=FeatureSet([feat])
	service_area_url = gis.properties.helperServices.serviceArea.url
	sa_layer = network.ServiceAreaLayer(service_area_url, gis=gis)
	travel_modes = sa_layer.retrieve_travel_modes()
	drive_mode = [t for t in travel_modes['supportedTravelModes'] if t['name'] == 'Driving Time'][0]
	result = sa_layer.solve_service_area(fs, default_breaks=[5,10,15], travel_direction='esriNATravelDirectionToFacility',travel_mode=drive_mode)
	return jsonify(result)

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
