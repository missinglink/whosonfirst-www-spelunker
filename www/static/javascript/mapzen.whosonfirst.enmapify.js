var mapzen = mapzen || {};
mapzen.whosonfirst = mapzen.whosonfirst || {};

mapzen.whosonfirst.enmapify = (function(){

		var self = {
			'render_id': function(map, wofid){

				var _self = self;

				if (! wofid){
					console.log("missing WOF ID");
					return false;
				}
				
				var on_fetch = function(geojson){
					self.render_feature(map, geojson);
				};

				var url = mapzen.whosonfirst.data.id2abspath(wofid);
				mapzen.whosonfirst.net.fetch(url, on_fetch);
			},

			'render_feature': function(map, feature){

				mapzen.whosonfirst.leaflet.fit_map(map, feature);

				var props = feature['properties'];
				
				var child_id = props['wof:id'];
				var parent_id = props['wof:parent_id'];
				
				var child_url = mapzen.whosonfirst.data.id2abspath(child_id);
				var parent_url = mapzen.whosonfirst.data.id2abspath(parent_id);
				
				var on_parent = function(parent_feature){
					
					var style = {
						"color": "#ffff00",
						"weight": 3,
						"opacity": 1,
						"fillOpacity": 0.8
					};
					
					mapzen.whosonfirst.leaflet.fit_map(map, parent_feature);

					parent_feature['properties']['lflt:label_text'] = parent_feature['properties']['wof:name'];
					mapzen.whosonfirst.leaflet.draw_poly(map, parent_feature, style);
					
					mapzen.whosonfirst.net.fetch(child_url, on_child);			
				};
	
				var on_child = function(child_feature){
		
					var style = {
						"color": "#ff69b4",
						"weight": 3,
						"opacity": 1,
						"fillOpacity": 0.8
					};

					var style2 = {
						"color": "#000000",
						"weight": .5,
						"opacity": 1,
						"fillColor": "#000000",
						"fillOpacity": .4,
					};
					
					mapzen.whosonfirst.leaflet.fit_map(map, child_feature);

					child_feature['properties']['lflt:label_text'] = "";
					mapzen.whosonfirst.leaflet.draw_bbox(map, child_feature, style2);

					child_feature['properties']['lflt:label_text'] = child_feature['properties']['wof:name'];
					mapzen.whosonfirst.leaflet.draw_poly(map, child_feature, style);
		
					var props = child_feature['properties'];
					var lat = props['geom:latitude'];
					var lon = props['geom:longitude'];
					
					var label_text = 'math centroid (shapely) is ';
					label_text += lat + ", " + lon;

					var pt = {
						'type': 'Feature',
						'geometry': { 'type': 'Point', 'coordinates': [ lon, lat ] },
						'properties': { 'lflt:label_text': label_text }
					};
					
					mapzen.whosonfirst.leaflet.draw_point(map, pt);

					if ((props['lbl:latitude']) && (props['lbl:longitude'])){

						var lat = props['lbl:latitude'];
						var lon = props['lbl:longitude'];

						var label_src = props['src:lbl:centroid'] || props['src:centroid_lbl'] || "UNKNOWN";

						var label_text = "label centroid (";
						label_text += label_src;
						label_text += ") is ";
						label_text += lat + ", " + lon;

						var pt = {
							'type': 'Feature',
							'geometry': { 'type': 'Point', 'coordinates': [ lon, lat ] },
							'properties': { 'lflt:label_text': label_text },
						};

						var style = {
							"color": "#fff",
							"weight": 3,
							"opacity": 1,
							"radius": 10,
							"fillColor": "#ff0000",
							"fillOpacity": .7
						};
					
						mapzen.whosonfirst.leaflet.draw_point(map, pt, style);
					}
				}
	
				if ((! parent_id) || (parent_id == -1)){
					mapzen.whosonfirst.net.fetch(child_url, on_child);
				}
				
				else {
					mapzen.whosonfirst.net.fetch(parent_url, on_parent);
				}
			},

			'enmapify_feature': function(map, collection){
				// please write me
			}
		};

		return self;

})();
