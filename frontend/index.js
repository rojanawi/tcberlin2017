
//var THE_SERVER_API = 'http://localhost:5000/calculate';
var THE_SERVER_API = '/api.json';
var STEP_SIZE = 0.01;

var qs = function param(object) {
    var encodedString = '';
    for (var prop in object) {
        if (object.hasOwnProperty(prop)) {
            if (encodedString.length > 0) {
                encodedString += '&';
            }
            encodedString += encodeURI(prop + '=' + object[prop]);
        }
    }
    return encodedString;
}


define('MapSymbol',[
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"
], function(SimpleMarkerSymbol, SimpleLineSymbol, Color) {
        return new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CIRCLE,
            12,
            new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_NULL,
            new Color([247, 34, 101, 0.9]),
            1
            ),
            new Color([207, 34, 171, 0.5])
        );
});

define('MapSquare',[
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",
    "esri/geometry/Polygon",
    "esri/graphic"
], function(SimpleFillSymbol, Color, Polygon, Graphic) {
    return function(position, travelTime, stepSize, minTravelTime, maxTravelTime){
      var n = Math.min(100*travelTime/maxTravelTime, 100)
      var squareColor = new Color([Math.round((255 * n) / 100),Math.round((255 * (100 - n)) / 100),0,0.2])
      var square = new Polygon([[position[0]+stepSize,position[1]+stepSize],[position[0]+stepSize,position[1]-stepSize],[position[0]-stepSize,position[1]-stepSize],[position[0]-stepSize,position[1]+stepSize]]);
      var symbol = new SimpleFillSymbol();
      symbol.setStyle(SimpleFillSymbol.STYLE_SOLID);
      symbol.setColor(squareColor);
      symbol.setOutline(null);
      return new Graphic(square, symbol)
}});

define('RedrawGraphicsLayer', ["MapSquare"], function(MapSquare) {
    var stepSize = STEP_SIZE;
    var RedrawGraphicsLayer = function(graphicsLayer) {
        this.graphicsLayer = graphicsLayer;
    }
    RedrawGraphicsLayer.prototype = {
        redraw: function(data) {
            var self = this;
            this.graphicsLayer.clear()
            var minTravelTime = 0;
            var maxTravelTime = 0;
            data.forEach(function(d){ // compute max
              if(d[1] > maxTravelTime) maxTravelTime = d[1]
            });
            data.forEach(function(travelTimeData) {
                var coords = travelTimeData[0]
                var travelTime = travelTimeData[1]
                self.graphicsLayer.add(
                    MapSquare(coords, travelTime, stepSize/2, minTravelTime, maxTravelTime))
            });
            this.graphicsLayer.redraw();
        }    
    }

    return RedrawGraphicsLayer;
});

define('ComputeDistanceCostMatrix', [ "RedrawGraphicsLayer" ],
 function(RedrawGraphicsLayer) {
    var stepSize = STEP_SIZE;
    
    ComputeDistanceCostMatrix = function(graphicsLayer) {
        this.graphicsLayer = graphicsLayer;
        this.redrawGraphicsLayer= new RedrawGraphicsLayer(graphicsLayer);
    }

    ComputeDistanceCostMatrix.prototype = {
        compute: function(coordinates) {
            console.dir("calling the api with coords, ma" + coordinates);
            var url = THE_SERVER_API + '?' + qs(coordinates);
            
            var self = this;

            fetch(url, coordinates).then(function(response) {
                if (response.status !== 200) {
                    return console.log('Looks like there was a problem. Status Code: ' + response.status);
                }
                console.log("the api returned, ma");

                response.json().then(function(data) {
                    var coords = data[1].rows[0].elements.map(function(element, i) {
                        var coord = [data[0].Coordinates[i][1], data[0].Coordinates[i][0]];
                        if(element.duration)
                            return [coord, element.duration.value]
                        else
                            return [coord, -1]
                    })
                    var filtered = coords.filter(function(c) { 
                        return c[1] != -1;
                    })
                    self.redrawGraphicsLayer.redraw(filtered);
                });
              }
            )
        }
    }
    return ComputeDistanceCostMatrix;
});


define('AppMap', [
    "esri/map", "esri/graphic",
    "MapSymbol", 'ComputeDistanceCostMatrix',
    "esri/layers/GraphicsLayer",
     "esri/geometry/webMercatorUtils"
], function(Map, Graphic, MapSymbol, ComputeDistanceCostMatrix, GraphicsLayer, webMercatorUtils) {
    return function(elName) {
        map = new Map(elName, {
            basemap: "gray",
            center: [13.406853, 52.517796],
            zoom: 15
        });

        var pois = [];

        var graphicsLayer = new GraphicsLayer();
        var poiLayer = new GraphicsLayer();
        map.addLayer(graphicsLayer);
        map.addLayer(poiLayer);

        var computeMatrix = new  ComputeDistanceCostMatrix(graphicsLayer);

        map.on('click',function(evt) {

            var lnglat = webMercatorUtils.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y);
            
            if (evt.graphic){
                poiLayer.remove(evt.graphic)
            } else {
                var mapPoint = evt.mapPoint;
                var graphic = new Graphic(mapPoint, MapSymbol);
                poiLayer.add(graphic);
            }
            
            var poiCoordinates = poiLayer.graphics.map(function(poiGraphic) {		
                var coords = webMercatorUtils.xyToLngLat(poiGraphic.geometry.x, poiGraphic.geometry.y);
                return { latitude: coords[1], longitude: coords[0] }		
            });

            /*var poiCoordinates = poiLayer.graphics.map(function(poiGraphic) {
              return { latitude: coords[1], longitude: coords[0] }
            });*/
            
            computeMatrix.compute({latitude: lnglat[1], longitude:lnglat[0]});
        });
        return map;
    }
});

require([
    "AppMap",
    "dojo/domReady!"
  ],
  function (AppMap) {
        var map = AppMap("mapDiv");
  });
