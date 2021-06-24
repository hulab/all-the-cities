const Pbf = require('pbf')
const fs = require('fs')
const path = require('path')

var pbf = new Pbf(fs.readFileSync(path.join(__dirname, 'cities.pbf')))
var cities = []

var lastLat = 0
var lastLon = 0
while (pbf.pos < pbf.length) {
    cities.push(pbf.readMessage(readCity, {
        cityId: '',
        name: '',
        altCounty:'',
        altName:'',
        country: '',
        featureCode: '',
        adminCode: '',
        population: 0,
        timeZone: '',
        loc: {
            type: 'Point',
            coordinates: [0, 0] //[lon,lat]
        }
    }))
}

module.exports = cities

function readCity(tag, city, pbf) {
    if (tag === 1) city.cityId = pbf.readSVarint()
    else if (tag === 2) city.name = pbf.readString()
    else if (tag === 3) city.country = pbf.readString()
    else if (tag === 4) city.altCountry = pbf.readString()
    else if (tag === 5) city.altName = pbf.readString().split(",")
    else if (tag === 6) city.muni = pbf.readString()
    else if (tag === 7) city.muniSub = pbf.readString()
    else if (tag === 8) city.featureCode = pbf.readString()
    else if (tag === 9) city.adminCode = pbf.readString()
    else if (tag === 10) city.population = pbf.readVarint()
    else if (tag === 11) city.timeZone = pbf.readVarint()
    else if (tag === 12) {
        lastLon += pbf.readSVarint()
        city.loc.coordinates[0] = lastLon / 1e5
    } else if (tag === 13) {
        lastLat += pbf.readSVarint()
        city.loc.coordinates[1] = lastLat / 1e5
    }
}
