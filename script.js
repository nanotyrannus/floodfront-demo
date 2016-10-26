if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
        console.log(position)
        let coords = position.coords
        map.setView([coords.latitude, coords.longitude])
        let mapElem = document.getElementById('map-container')
        mapElem.classList.remove('hide')
        mapElem.classList.add('show')
        document.getElementById('loading-splash').style.display = "none"
    })
} else {
    alert("Geolocation API not supported in this browser!")
}
var map = L.map('map')

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 19,
    id: 'your.mapbox.project.id',
    accessToken: 'pk.eyJ1IjoibmFub3R5cmFubnVzIiwiYSI6ImNpcnJtMmNubDBpZTN0N25rZmMxaHg4ZHQifQ.vj7pif8Z4BVhbYs55s1tAw'
}).addTo(map)

map.setView([0, 0], 17)

marker_count = 0
var markers = new Map()
var selectedMarker = null

map.on('click', event => {
    let line = generateLine(event.latlng, 0.003)
    let direction = generateLine(event.latlng, -90, 0.003, 0, 1)
    let marker = L.marker(event.latlng, {
        'draggable': true
    })
    marker.line = line
    marker.direction = direction
    marker.on('drag', event => {
        line.moveTo(event.latlng)
        direction.moveTo(event.latlng)
        selectedMarker = marker
        $('#slider').slider('value', line.getRotation())
    })
    marker.on('click', event => {
        selectedMarker = marker
        $('#slider').slider('value', line.getRotation())
    })
    markers.set(marker_count++, marker)
    marker.addTo(map)
    line.addTo(map)
    direction.addTo(map)
    selectedMarker = marker
    $('#slider').slider('value', 0)
})

function generateLine(latlng, _deg = 0, _length = 0.005, _mag_0 = 1, _mag_1 = 1) {
    let LENGTH = _length
    let mag_0 = _mag_0, mag_1 = _mag_1
    let lat = latlng.lat
    let lng = latlng.lng
    let deg = _deg //Degrees of rotation
    let latlngs = [[lat - mag_0 * Math.sin((deg / 360) * Math.PI * 2) * LENGTH / 2, lng - mag_0*Math.cos((deg / 360) * Math.PI * 2) * LENGTH / 2], [lat + mag_1*Math.sin((deg / 360) * Math.PI * 2) * LENGTH / 2, lng + mag_1*Math.cos((deg / 360) * Math.PI * 2) * LENGTH / 2]]
    let line = L.polyline(latlngs)
    line.moveTo = function (latlng) {
        lat = latlng.lat
        lng = latlng.lng
        line.setLatLngs([[lat - mag_0 * Math.sin((deg / 360) * Math.PI * 2) * LENGTH / 2, lng - mag_0*Math.cos((deg / 360) * Math.PI * 2) * LENGTH / 2], [lat + mag_1*Math.sin((deg / 360) * Math.PI * 2) * LENGTH / 2, lng + mag_1*Math.cos((deg / 360) * Math.PI * 2) * LENGTH / 2]])
        line.redraw()
    }
    line.setRotation = function (_deg) {
        deg = _deg
        line.setLatLngs([[lat - mag_0 * Math.sin((deg / 360) * Math.PI * 2) * LENGTH / 2, lng - mag_0*Math.cos((deg / 360) * Math.PI * 2) * LENGTH / 2], [lat + mag_1*Math.sin((deg / 360) * Math.PI * 2) * LENGTH / 2, lng + mag_1*Math.cos((deg / 360) * Math.PI * 2) * LENGTH / 2]])
        line.redraw()
    }
    line.getRotation = function () {
        return deg
    }
    return line
}

// var input = document.getElementById('rotation-input')
// input.addEventListener('keypress', event => {
//     if (event.keyCode === 13) {
//         if (isNaN(Number(input.value))) {
//             alert(`Invalid number: ${input.value}`)
//             input.value = ""
//         } else {
//             selectedMarker.line.setRotation(input.value)
//         }
//         input.value = "" //Clears text
//     }
// })

$('#slider').slider({
    'min' : 0,
    'max' : 360,
    'slide' : function (event, ui) {
        if (selectedMarker) {
            selectedMarker.line.setRotation(ui.value)
            selectedMarker.direction.setRotation(ui.value - 90)
        }
    }
})