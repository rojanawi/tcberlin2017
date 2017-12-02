require([
    "esri/InfoTemplate",
    "esri/layers/FeatureLayer",
    
    "esri/map", "esri/graphic",
    "esri/renderers/HeatmapRenderer", "esri/layers/CSVLayer",
    "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/Color",

    "esri/geometry/webMercatorUtils",
    "dojo/domReady!"
  ],
  function (InfoTemplate,
    FeatureLayer, 
    Map, Graphic, 
    HeatmapRenderer, CSVLayer,
    SimpleMarkerSymbol, SimpleLineSymbol, Color,
    webMercatorUtils){

        var symbolFac = function() {
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
        };

        var init = function() {
            map = new Map("mapDiv", {
                basemap: "gray",
                center: [13, 52],
                zoom: 7
            });

            var symbol = symbolFac();
                
            map.on('click',function(evt) {
                var mapPoint = evt.mapPoint;
                map.graphics.add(new Graphic(mapPoint, symbol));
                var normalizedVal = webMercatorUtils.xyToLngLat(evt.mapPoint.x, evt.mapPoint.y);
                console.dir(normalizedVal);
            })
            return map;
        };

        var addLayer = function(map) {
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

        var map = init();

        $('#somebtn').on('click', function() {
            addLayer(map);
        })       
  });
