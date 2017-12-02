
var THE_SERVER_API = '/backend/api.php';

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

define('AppMap', [
    "esri/map", "esri/graphic",
    "MapSymbol", "esri/geometry/webMercatorUtils"
], function(Map, Graphic, MapSymbol,webMercatorUtils) {
    return function(elName) {
        map = new Map(elName, {
            basemap: "gray",
            center: [13, 52],
            zoom: 7
        });
            
        map.on('click',function(evt) {
            var mapPoint = evt.mapPoint;
            map.graphics.add(new Graphic(mapPoint, MapSymbol));
            var normalizedVal = webMercatorUtils.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y);
            console.dir(normalizedVal);
        });
        return map;
    }
});

require([
    "esri/layers/FeatureLayer",
    "esri/renderers/HeatmapRenderer", "esri/layers/CSVLayer",
    "AppMap",
    "dojo/domReady!"
  ],
  function (
    FeatureLayer, 
    HeatmapRenderer, CSVLayer,
    AppMap) {
        var map = AppMap("mapDiv");      

        var addLayer = function() {
            var heatmapFeatureLayerOptions = {
                mode: FeatureLayer.MODE_SNAPSHOT,
                outFields: [
                    "atmcond",
                    "numfatal",
                    "conszone",
                    "age",
                    "alcres",
                    "sex"
                ]
            };
    
            esriConfig.defaults.io.corsEnabledServers.push("earthquake.usgs.gov");
            var csv = new CSVLayer("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.csv", {
                //fields: [{name: "depth", type: "Number"}]
            });
    
            var heatmapRenderer = new HeatmapRenderer({
                colors: ["rgba(0, 0, 255, 0)","rgb(0, 0, 255)","rgb(255, 0, 255)", "rgb(255, 0, 0)"],
                blurRadius: 12,
                maxPixelIntensity: 250,
                minPixelIntensity: 10,
                field: 'mag'
            });
            csv.setRenderer(heatmapRenderer);
            map.addLayer(csv);
        }

        var callTheApi = function() {
            console.log("calling the api, ma");
            fetch(THE_SERVER_API).then(
              function(response) {
                if (response.status !== 200) {
                    return console.log('Looks like there was a problem. Status Code: ' + response.status);
                }
            
                response.json().then(function(data) {
                    console.log("the api returned, ma");
                    addLayer();
                    console.dir(data);
                });
              }
            )
        }
     
        $('#somebtn').on('click', function() {
            callTheApi()
        })       
  });
