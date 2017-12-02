from flask import Flask, flash, render_template, url_for, request, redirect, session
import os





app = Flask(__name__, static_folder='../../frontend', static_url_path='')
app.secret_key = '1234'

app.debug = True


app.config.from_object(__name__)




@app.route('/')
def home2():
        return app.send_static_file('index.html')

import Server.distance_matrix_calculator



if __name__ == "__main__":
    sess.init_app(app)
    app.run(debug=True,host='0.0.0.0', port=3000)
