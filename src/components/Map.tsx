import { useRef, useState } from 'react'
import styled from '@emotion/styled'
import Pin from './Pin'
import Token from './Token'
import { Location } from '../common/types'
import coordinates from '../coords'
import ReactMapGL, { FullscreenControl, Popup, MapRef } from 'react-map-gl'
import SearchBar from './SearchBar'

const SearchBarContainer = styled.div`
  position: fixed;
  top: 1.5vh;
  left: 1vw;
  z-index: 99999;
`

const fullscreenControlStyle = {
  right: 10,
  top: 10,
}

const Map = () => {
  const mapRef = useRef<MapRef>(null)
  const [viewport, setViewport] = useState({
    width: 400,
    height: 400,
    latitude: 35.27517,
    longitude: 43.59593,
    zoom: 1,
  })

  const [location, setLocation] = useState<Location | null>()

  const selectLocation = (location: Location) => {
    setLocation(location)
  }

  const markers = []
  if (mapRef.current) {
    const bounds = mapRef.current.getMap().getBounds()
    let pins = 0
    for (let entry of Array.from(coordinates)) {
      console.log(entry)
      const key = entry[0]
      const lat = entry[1][0]
      const lng = entry[1][1]
      if (bounds.contains([lng, lat])) {
        markers.push(<Pin key={key} location={{ id: key, latitude: lat, longitude: lng }} select={selectLocation} />)
        pins += 1
      }

      if (pins >= 20) {
        break
      }
    }
  }

  return (
    <>
      <SearchBarContainer>
        <SearchBar />
      </SearchBarContainer>
      <ReactMapGL
        {...viewport}
        width="100vw"
        height="100vh"
        onViewportChange={setViewport}
        ref={mapRef}
        mapboxApiAccessToken="pk.eyJ1IjoiY3J5cHRvbWF5b3IiLCJhIjoiY2tuYzh5bHAwMGJocjJvcnpzdGltdmZtOSJ9.H5wrB8rdRFgzgKbtPi3z5Q"
      >
        <FullscreenControl style={fullscreenControlStyle} />
        {markers}
        {location && (
          <Popup
            latitude={location.latitude}
            longitude={location.longitude}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setLocation(null)}
            anchor="top"
          >
            <Token id={location.id} />
          </Popup>
        )}
      </ReactMapGL>
    </>
  )
}

export default Map
