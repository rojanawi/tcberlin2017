from Server import app
from flask import Flask, flash, render_template, url_for, request, redirect, session, jsonify
import os
from datetime import datetime
import googlemaps
from ast import literal_eval
gmaps = googlemaps.Client(key='AIzaSyA2eFpbH0vjcilxHTCx0l0dUYTKqJwwgZ4')

@app.route('/calculate', methods=['POST', 'GET'])
def generate_tuples():
	latitude=float(request.args.get('latitude'))
	longitude=float(request.args.get('longitude'))
	centerTuple=(latitude,longitude)
	step=0.01
	gridSize=(-2,2)
	Matrix = [(centerTuple[0]+i*step,centerTuple[1]+j*step) for i in range(gridSize[0], gridSize[1]) for j in range(gridSize[0],gridSize[1])]
	distance_matrix=gmaps.distance_matrix(centerTuple, Matrix, mode='walking')
	Matrix = {'Coordinates': Matrix}
	return jsonify(Matrix, distance_matrix)
