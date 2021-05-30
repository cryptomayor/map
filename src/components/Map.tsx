import { useEffect, useRef, useState } from 'react'
import Pin from './Pin'
import Token from './Token'
import { CryptoMayorLocation } from '../common/types'
import coordinates from '../coords'
import ReactMapGL, { FullscreenControl, Popup, MapRef, FlyToInterpolator, ViewportProps } from 'react-map-gl'
import SearchBar from './SearchBar'
import { easeCubic } from 'd3-ease'

const fullscreenControlStyle = {
  right: 10,
  top: 10,
}

const Map = () => {
  const mapRef = useRef<MapRef>(null)
  const [viewport, setViewport] = useState<ViewportProps>({
    width: 400,
    height: 400,
    latitude: 35.27517,
    longitude: 43.59593,
    zoom: 1,
  })

  const [selectedLocation, setSelectedLocation] = useState<CryptoMayorLocation | null>()
  const [visibleLocations, setVisibleLocations] = useState<CryptoMayorLocation[]>([])
  const selectLocation = (location: CryptoMayorLocation, focus: boolean) => {
    if (focus) {
      setViewport({
        width: 400,
        height: 400,
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: 8,
        transitionDuration: 2500,
        transitionInterpolator: new FlyToInterpolator(),
        transitionEasing: easeCubic,
      })
    }

    setSelectedLocation(location)
  }

  const selectLocationByID = (id: number, focus: boolean = true) => {
    const location = coordinates.get(id)

    if (!location) {
      return
    }

    selectLocation({ id, latitude: location[0], longitude: location[1] }, focus)
  }

  useEffect(() => {
    const newVisibleLocations = []

    if (mapRef.current) {
      const bounds = mapRef.current.getMap().getBounds()
      let pins = 0
      for (let entry of Array.from(coordinates)) {
        const id = entry[0]
        const latitude = entry[1][0]
        const longitude = entry[1][1]
        if (bounds.contains([longitude, latitude])) {
          newVisibleLocations.push({ id, latitude, longitude })
          pins += 1
        }

        if (pins >= 20) {
          break
        }
      }
    }

    setVisibleLocations(newVisibleLocations)
  }, [viewport])

  // Used to verify that we actually render a Pin for a currently selected location
  let isDisplayingSelectedLocation = false

  return (
    <>
      <SearchBar coordinates={coordinates} onSearchSelected={selectLocationByID} />
      <ReactMapGL
        {...viewport}
        width="100vw"
        height="100vh"
        onViewportChange={setViewport}
        ref={mapRef}
        mapboxApiAccessToken="pk.eyJ1IjoiY3J5cHRvbWF5b3IiLCJhIjoiY2tuYzh5bHAwMGJocjJvcnpzdGltdmZtOSJ9.H5wrB8rdRFgzgKbtPi3z5Q"
      >
        <FullscreenControl style={fullscreenControlStyle} />
        {visibleLocations.map(({ id, latitude, longitude }) => {
          if (id === selectedLocation?.id) {
            isDisplayingSelectedLocation = true
          }
          return <Pin key={id} location={{ id, latitude, longitude }} select={selectLocation} />
        })}
        {selectedLocation && !isDisplayingSelectedLocation && (
          <Pin key={selectedLocation.id} location={selectedLocation} select={selectLocation} />
        )}
        {selectedLocation && (
          <Popup
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setSelectedLocation(null)}
            anchor="top"
          >
            <Token id={selectedLocation.id} />
          </Popup>
        )}
      </ReactMapGL>
    </>
  )
}

export default Map
