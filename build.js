#!/usr/bin/env node

const fs = require('fs')
const split = require('split2')
const through = require('through2')
const cities = require('cities-with-1000');
const Pbf = require('pbf')

var pbf = new Pbf()

var lastLat = 0
var lastLon = 0

var rowStream = through(function (line, enc, next) {
    var row = line.toString().split('\t').reduce(function (acc, x, ix) {
        var key = cities.fields[ix]
        if (key === 'alternativeNames') x = x.split(',')
        if (key === 'lat' || key === 'lon') x = parseFloat(x)
        if (key === 'elevation') x = x ? parseInt(x, 10) : undefined
        if (key === 'population') x = x ? parseInt(x, 10) : undefined

        acc[key] = x
        return acc
    }, {})
    if (!row.id) return
    pbf.writeRawMessage(writeCity, row)

    next()
})

function writeCity(city, pbf) {
    pbf.writeSVarintField(1, city.id)
    pbf.writeStringField(2, city.name)
    pbf.writeStringField(3, city.country)
    
    if (city.altCountry && city.altCountry !== city.country)
        pbf.writeStringField(4, city.altCountry)
    
    if (city.alternativeNames)
        pbf.writeStringField(5, city.alternativeNames)

    if (city.municipality)
        pbf.writeStringField(6, city.municipality)

    if (city.municipalitySubdivision)
        pbf.writeStringField(7, city.municipalitySubdivision)

    pbf.writeStringField(8, city.featureCode)
    pbf.writeStringField(9, city.adminCode)

    if (city.population)
        pbf.writeVarintField(10, city.population)

    if (city.tz)
        pbf.writeVarintField(11, city.tz)

    const lat = Math.round(1e5 * city.lat)
    const lon = Math.round(1e5 * city.lon)
    pbf.writeSVarintField(12, lon - lastLon)
    pbf.writeSVarintField(13, lat - lastLat)
   
   
    lastLat = lat
    lastLon = lon
}

fs.createReadStream(cities.file)
    .pipe(split())
    .pipe(rowStream)

rowStream.on('finish', function () {
    process.stdout.write(Buffer.from(pbf.finish()))
})
