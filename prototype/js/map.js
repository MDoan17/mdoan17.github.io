var map;
var infobox;
var polygons = [];
var nh_pops = [];
var nh_ages = [];
var nh_pd = [];
var nh_hhs = [];
var neighbourhoods = boundaries.features;
var polygon;
var factor_weights = [6,4,5,7];
var min = 10000000;
var max = 0;
var isWifi = false;
var sliders;
var outputs;

function loadMapScenario() {
    map = new Microsoft.Maps.Map(document.getElementById('myMap'), {});

    getPopulation();
    getAge();
    getPopDens();
    getHHSize();
    setPopulation();
    setAge();
    setPopDens();
    setHHSize();

    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        title: 'Title',
        description: 'Description',
        visible: false
    });
    infobox.setMap(map);

    var count = 0;
    neighbourhoods.forEach(function(e) {
        polygon = coordsToPoly(e.geometry.coordinates, count++);
        polygons.push(polygon);
    });

    count = 0;
    polygons.forEach(function(e) {
        e.setOptions({ fillColor: factorColor(factorSum(factors.factors[count++]))});
    });
    map.entities.push(polygons);

    putPushpins();

}

function putPushpins() {
    var pushpins = []

    wifi_locations.forEach(function(e) {
        if (e["wireless"] == "yes" || !isWifi) {
            var pushpin_color = e["wireless"] == "yes" ? "#1414AD" : "#AD14AD";
            var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(parseFloat(e["lat"]), parseFloat(e["long"])), {
                color: pushpin_color
            });
            pushpinClick = new Microsoft.Maps.Events.addHandler(pushpin, 'click', function(i) {
                infobox.setOptions({
                    //Use the location of where the mouse was clicked to position the infobox
                    title: e["name"],
                    description: e["street_num"] + " " + e["street_name"] + "<br>Latitude: " + e["lat"] + "<br>Longitude: " + e["long"],
                    location: i.target.getLocation(),
                    visible: true
                });
            });
            pushpins.push(pushpin);
        }
    });
    map.entities.push(pushpins);
}

function coordsToPoly(coordsList, id) {
    var mmlData = [];
    coordsList[0].forEach(function(e){
        mmlData.push(new Microsoft.Maps.Location(e[1], e[0]));
    });
    var factor_value = factorSum(factors.factors[id]);
    min = factor_value < min ? factor_value : min
    max = factor_value > max ? factor_value : max;
    return (new Microsoft.Maps.Polygon(mmlData, null));
}

function factorSum(f) {
    var fs = [f.factor1, f.factor2, f.factor3, f.factor4];
    var sum = fs[0] * factor_weights[0] + fs[1] * factor_weights[1] + fs[2] * factor_weights[2] + fs[3] * factor_weights[3];
    return sum;
}

function factorColor(sum) {
    if (max == min) {
        return '#FFFFFF';
    } else {
        var percent_color = (sum - min) / (max - min);

        var red = Math.min(percent_color / 0.5, 1);
        var green = Math.min((1 - percent_color) / 0.5, 1);
        var blue = (red + green - 1);

        red = Math.floor(red * 255).toString(16);
        green = Math.floor(green * 255).toString(16);
        blue = Math.floor(blue * 255).toString(16);

        var hr = red.length == 1 ? "0" + red : red;
        var hg = green.length == 1 ? "0" + green : green;
        var hb = blue.length == 1 ? "0" + blue : blue;

        return '#'+hr+hg+hb;
    }
}

function colorPolygon(id) {
    return factorColor(factorSum(id));
}

function removePins() {
    for (i = map.entities.getLength() - 1; i >= 0; i--) {
        var pushpin = map.entities.get(i);
        if (pushpin instanceof Microsoft.Maps.Pushpin) {
            map.entities.removeAt(i);
        }
    }
}

function filterWiFi() {
    isWifi = !isWifi;
    removePins();
    putPushpins();
    $('#btn_wifi').toggleClass('btn-primary');
}

function removePolygons() {
    for (i = map.entities.getLength() - 1; i >= 0; i--) {
        var pushpin = map.entities.get(i);
        if (pushpin instanceof Microsoft.Maps.Polygon) {
            map.entities.removeAt(i);
        }
    }
    polygons = [];
    min = 10000000;
    max = -1000000;
}

function updateWeights() {
    factor_weights = [Number($('#w1').text()),Number($('#w2').text()),Number($('#w3').text()),Number($('#w4').text())];
    removePolygons();
    setPopulation();
    setAge();

    var count = 0;
    neighbourhoods.forEach(function(e) {
        polygon = coordsToPoly(e.geometry.coordinates, count++);
        polygons.push(polygon);
    });
    count = 0;
    polygons.forEach(function(e) {
        e.setOptions({ fillColor: factorColor(factorSum(factors.factors[count++]))});
    });
    map.entities.push(polygons);
}

function getPopulation() {
    for (n in neighbourhoods) {
    	var nh_num = neighbourhoods[n].properties.NH_NUMBER;
    	var sum = 0;
    	for (key in census_tract[0].features[0].properties) {
    		if (key.includes("_5370" + nh_num + "_")) {
    			sum += Number(census_tract[0].features[0].properties[key]);
    		}
    	}
    	nh_pops.push([nh_num, sum]);
    }
}

function maxPop() {
    var max_pop = 0;
    for (i = 0; i < nh_pops.length; i++){
        if (max_pop < Number(nh_pops[i][1])) {
            max_pop = Number(nh_pops[i][1]);
        }
    }
    return max_pop;
}

function setPopulation() {
    var max_p = maxPop();
    for (i = 0; i < nh_pops.length; i++){
        factors.factors[i].factor2 = Number(nh_pops[i][1]) * 10 / max_p;
    }
}

function getAge() {
    for (n in neighbourhoods) {
    	var nh_num = neighbourhoods[n].properties.NH_NUMBER;
    	var sum = 0;
      var c = 0;
    	for (key in census_tract[0].features[38].properties) {
    		if (key.includes("_5370" + nh_num + "_")) {
    			sum += Number(census_tract[0].features[38].properties[key]);
                c++;
    		}
    	}
        if (isNaN(sum/c)) {
            nh_ages.push([nh_num, 0]);
        } else {
            nh_ages.push([nh_num, sum/c]);
        }
    }
}

function maxAge() {
    var max_age = 0;
    for (i = 0; i < nh_ages.length; i++){
        if (max_age < Number(nh_ages[i][1])) {
            max_age = Number(nh_ages[i][1]);
        }
    }
    return max_age;
}

function avgAge() {
    var sum_ages = 0;
    var amount = 0;
    for (i = 0; i < nh_ages.length; i++){
        if (Number(nh_ages[i][1]) > 0) {
            sum_ages += Number(nh_ages[i][1]);
            amount++;
        }
    }
    return sum_ages/amount;
}

function setAge() {
    var max_a = maxAge();
    var avg_a = avgAge();
    for (i = 0; i < nh_ages.length; i++){
        if (Number(nh_ages[i][1]) > 0) {
            factors.factors[i].factor1 = (max_a - Number(nh_ages[i][1])) * 10 / max_a;
        } else {
            factors.factors[i].factor1 = (max_a - avg_a) * 10 / max_a;
        }
    }
}

function getPopDens() {
    for (n in neighbourhoods) {
    	var nh_num = neighbourhoods[n].properties.NH_NUMBER;
    	var sum = 0;
      var c = 0;
    	for (key in census_tract[0].features[5].properties) {
    		if (key.includes("_5370" + nh_num + "_")) {
    			sum += Number(census_tract[0].features[5].properties[key]);
                c++;
    		}
    	}
        if (isNaN(sum/c)) {
            nh_pd.push([nh_num, 0]);
        } else {
            nh_pd.push([nh_num, sum/c]);
        }
    }
}

function maxPopDens() {
    var max_pd = 0;
    for (i = 0; i < nh_ages.length; i++){
        if (max_pd < Number(nh_pd[i][1])) {
            max_pd = Number(nh_pd[i][1]);
        }
    }
    return max_pd;
}

function avgPopDens() {
    var sum_pd = 0;
    var amount = 0;
    for (i = 0; i < nh_pd.length; i++){
        if (Number(nh_pd[i][1]) > 0) {
            sum_pd += Number(nh_pd[i][1]);
            amount++;
        }
    }
    return sum_pd/amount;
}

function setPopDens() {
    var max_dens = maxPopDens();
    var avg_dens = avgPopDens();
    for (i = 0; i < nh_pd.length; i++){
        if (Number(nh_pd[i][1]) > 0) {
            factors.factors[i].factor3 = (max_dens - Number(nh_pd[i][1])) * 10 / max_dens;
        } else {
            factors.factors[i].factor3 = (max_dens - avg_dens) * 10 / max_dens;
        }
    }
}

function getHHSize() {
    for (n in neighbourhoods) {
    	var nh_num = neighbourhoods[n].properties.NH_NUMBER;
    	var sum = 0;
      var c = 0;
    	for (key in census_tract[0].features[58].properties) {
    		if (key.includes("_5370" + nh_num + "_")) {
    			sum += Number(census_tract[0].features[58].properties[key]);
                c++;
    		}
    	}
        if (isNaN(sum/c)) {
            nh_hhs.push([nh_num, 0]);
        } else {
            nh_hhs.push([nh_num, sum/c]);
        }
    }
}

function maxHHSize() {
    var max_hhs = 0;
    for (i = 0; i < nh_ages.length; i++){
        if (max_hhs < Number(nh_hhs[i][1])) {
            max_hhs = Number(nh_hhs[i][1]);
        }
    }
    return max_hhs;
}

function avgHHSize() {
    var sum_hh = 0;
    var amount = 0;
    for (i = 0; i < nh_hhs.length; i++){
        if (Number(nh_hhs[i][1]) > 0) {
            sum_hh += Number(nh_hhs[i][1]);
            amount++;
        }
    }
    return sum_hh/amount;
}

function setHHSize() {
    var max_hh = maxHHSize();
    var avg_hh = avgHHSize();
    for (i = 0; i < nh_hhs.length; i++){
        if (Number(nh_hhs[i][1]) > 0) {
            factors.factors[i].factor4 = (max_hh - Number(nh_hhs[i][1])) * 10 / max_hh;
        } else {
            factors.factors[i].factor4 = (max_hh - avg_hh) * 10 / max_hh;
        }
    }
}


$(document).ready(function() {
    sliders = document.getElementsByClassName("custom-range");
    outputs = document.getElementsByClassName("weights");
    for (i = 0; i < sliders.length; i++) {
        sliders[i].label = outputs[i];
        sliders[i].oninput = function() {
            var value = (this.value) / 5;
            this.label.innerHTML = value;
        }
    }
});
