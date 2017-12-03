
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

define('MakeMapSymbol',[
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color"
], function(SimpleMarkerSymbol, SimpleLineSymbol, Color) {

    var _col = function(poiType) {
        switch(poiType) {
            case 'work': return new Color([247, 34, 101, 0.9]); break;
            case 'school': return new Color([34, 247, 101, 0.9]); break;
            case 'friend': return new Color([247, 180, 34, 0.9]); break;
            case 'facility': return new Color([101, 247, 34, 0.9]); break;
        }    
    }

    return function(poiType) {
        var color = _col(poiType);

        return new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CIRCLE,
            16,
            new SimpleLineSymbol(
                SimpleLineSymbol.STYLE_NULL,
                color, 
                1
            ),
            color
        );
    }
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
        compute: function(params) {
            console.dir(params);
//            var url = THE_SERVER_API + '?' + qs(coordinates);

            var self = this;

            fetch(THE_SERVER_API,{
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  method: "POST",
                  body: JSON.stringify(params)
            }).then(function(response) {
                if (response.status !== 200) {
                    return console.log('Looks like there was a problem. Status Code: ' + response.status);
                }
                console.log("the api returned, ma");

                response.json().then(function(data) {
                    var coords = data[1].rows[0].elements.map(function(element, i) {
                        var coord = [data[0].Coordinates[i][1], data[0].Coordinates[i][0]];
                        var totalDuration = data[1].rows.reduce(function(acc,row) {
                          if (row.elements[i].duration && acc != -1) 
                            return acc + row.elements[i].duration.value
                          else 
                            return -1
                        }, 0);
                        return [coord, totalDuration]
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
    "MakeMapSymbol", 'ComputeDistanceCostMatrix',
    "esri/layers/GraphicsLayer",
     "esri/geometry/webMercatorUtils"
], function(Map, Graphic, MakeMapSymbol, ComputeDistanceCostMatrix, GraphicsLayer, webMercatorUtils) {
    var AppMap = function(elName, ctx) {
        this.elName = elName;
        this.ctx = ctx;
    }

    AppMap.prototype = {
        init: function() {
            this.map = new Map(this.elName, {
                basemap: "gray",
                center: [13.406853, 52.517796],
                zoom: 15
            });
            this.graphicsLayer = new GraphicsLayer();
            this.computeMatrix = new  ComputeDistanceCostMatrix(this.graphicsLayer);
            this.poiLayer = new GraphicsLayer();

            this.map.addLayer(this.graphicsLayer);
            this.map.addLayer(this.poiLayer);
            var self = this;

            this.map.on('click',function(evt) {   
                var lnglat = webMercatorUtils.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y);
                if (evt.graphic && evt.graphic.geometry.type == "point"){
                    self.dropPoi(evt.graphic)
                } else {
                   self.addPoi(evt.mapPoint)
                }
                self.onChange();
            })
        },

        setPoiType: function(poiType) {
            this.poiType = poiType;
        },
        
        onChange: function() {
            var poiCoordinates = this.poiLayer.graphics.map(function(poiGraphic) {
                var coords = webMercatorUtils.xyToLngLat(poiGraphic.geometry.x, poiGraphic.geometry.y);
                return { latitude: coords[1], longitude: coords[0] }
            });
            var lnglat = poiCoordinates[0];

            this.computeMatrix.compute({ lnglat: lnglat, transportationMode: this.ctx.mode });
        },

        addPoi: function(mapPoint) {
            var graphic = new Graphic(mapPoint, MakeMapSymbol(this.poiType) );
            this.poiLayer.add(graphic);
        },

        dropPoi: function(graphic) {
            this.poiLayer.remove(graphic);
        },

        ctxChanged: function() {
            this.onChange();
        }
    }
    return AppMap;
});

require([
    "AppMap",
    "dojo/domReady!"
  ],
  function (AppMap) {
        var map = new AppMap("mapDiv", {
            mode: $('#mode').val()
        });

        map.setPoiType($('#poitype').val());
        map.init();

        $('#mode').on('change', function() {
            map.ctx.mode = $(this).val()
            map.onChange()
        });

        $('#poitype').on('change',function() {
            map.setPoiType($(this).val()); 
        });
  });
