
var THE_SERVER_API = '/calculate';
var STEP_SIZE = 0.1;

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
        return function(position, travelTime, stepSize){
          var square = new Polygon([[position[0]+stepSize,position[1]+stepSize],[position[0]+stepSize,position[1]-stepSize],[position[0]-stepSize,position[1]-stepSize],[position[0]-stepSize,position[1]+stepSize]]);
          var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_DASHDOT, new Color([255,0,0], 2),new Color([255,255,0,0.25]));
        return new Graphic(square, symbol)
}});


define('ComputeDistanceCostMatrix', ["MapSquare"],
 function(MapSquare) {    
        return function(coordinates, graphicsLayer) {
            var stepSize = STEP_SIZE;
            var redrawGraphicsLayer = function(data) {
                var data_ = [[[0.1,0.1],1],[[0.2,0.2],2],[[0.3,0.3],3]]
                graphicsLayer.clear()
                data_.forEach(function(travelTimeData) {
                    var coords = travelTimeData[0]
                    var travelTime = travelTimeData[1]
                    graphicsLayer.add(
                        MapSquare(coords, travelTime, stepSize/2))
                });
                graphicsLayer.redraw();
            }

            console.log("calling the api with coords, ma" + coordinates);
            var url = THE_SERVER_API + '?' + qs(coordinates);

            fetch(url, coordinates).then(
              function(response) {
                if (response.status !== 200) {
                    return console.log('Looks like there was a problem. Status Code: ' + response.status);
                }
    
                response.json().then(function(data) {
                    console.log("the api returned, ma");
                    redrawGraphicsLayer(data);
                    console.dir(data);
                });
              }
            )
        }

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
            center: [0, 0],
            zoom: 7
        });

        var graphicsLayer = new GraphicsLayer();
        map.addLayer(graphicsLayer);

        map.on('click',function(evt) {
            var mapPoint = evt.mapPoint;
            map.graphics.add(new Graphic(mapPoint, MapSymbol));
            var normalizedVal = webMercatorUtils.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y);
            
            ComputeDistanceCostMatrix({lat: normalizedVal[1], lon:normalizedVal[0]}, graphicsLayer);
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
