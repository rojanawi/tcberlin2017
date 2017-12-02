from Server import app
from flask import Flask, flash, render_template, url_for, request, redirect, session
import os
from datetime import datetime
import googlemaps
from ast import literal_eval
gmaps = googlemaps.Client(key='AIzaSyB8HBULX1Kov_bhrDnhi9XrT8N0L3kjscw')


@app.route('/calculate', methods=['POST', 'GET'])
def generate_tuples():
	latitude=float(request.args.get('latitude'))
	longitude=float(request.args.get('longitude'))
	centerTuple=(latitude,longitude)
	step=0.01
	gridSize=(-5,5)
	Matrix = [(centerTuple[0]+i*step,centerTuple[1]+j*step) for i in range(gridSize[0], gridSize[1]) for j in range(gridSize[0],gridSize[1])]
	return str(gmaps.distance_matrix(centerTuple, Matrix, mode='walking'))
