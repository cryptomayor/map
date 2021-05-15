import './App.css'
import { useState, useRef, useEffect } from 'react'
import ReactMapGL, { Marker, FullscreenControl, Popup, MapRef } from 'react-map-gl'
import 'bootstrap/dist/css/bootstrap.min.css'
import Coordinates from './coords'
import { FaMapPin, FaTwitter } from 'react-icons/fa'

interface Metadata {
  elevation: number
  image?: string
  timezone: string
  continent: string
  population: number
  name: string
  asciiname: string
  country: string
  longitude: number
  admin1: string
  admin2: string
}

type Location = {
  id: number
  longitude: number
  latitude: number
}

const fullscreenControlStyle = {
  right: 10,
  top: 10,
}

interface PinProps {
  location: Location
  select: Function
}

const Pin = ({ location, select }: PinProps) => {
  return (
    <Marker
      key={location.id}
      offsetTop={-30}
      offsetLeft={-15}
      longitude={location.longitude}
      latitude={location.latitude}
    >
      <FaMapPin size={30} onClick={() => select(location)} />
    </Marker>
  )
}

function Map() {
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
    for (let coordinates of Coordinates) {
      const key = coordinates[0]
      const lat = coordinates[1]
      const lng = coordinates[2]

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
  )
}

function Token({ id }: { id: number }) {
  const policyId = '5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47'
  const dandelionAPI = 'https://graphql-api.mainnet.dandelion.link'
  const metadataEndpoint = `metadata/CryptoMayor${id}`

  const [owner, setOwner] = useState<string | null>()
  const [metadata, setMetadata] = useState<Metadata | null>()
  const [twitterHandle, setTwitterHandle] = useState<string | null>('')
  const assetId =
    policyId +
    `CryptoMayor${id}`
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')

  const displayChainMetadata = (forOwner: string) => {
    const query = JSON.stringify({
      query: `query {transactions(where: {_and: [{inputs: {address: {_eq: "${forOwner}"}}}{outputs: {address: {_eq: "${forOwner}"}}}]}) {metadata {key, value}, outputs {address}, includedAt, inputs {tokens {asset {fingerprint, assetId, assetName}}}}}`,
    })

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: query,
    }

    fetch(dandelionAPI, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.data.transactions.length > 0) {
          const sortedList = data.data.transactions.sort((a: { includedAt: number }, b: { includedAt: number }) =>
            a.includedAt > b.includedAt ? 1 : -1
          )
          const mostRecent = sortedList[sortedList.length - 1]
          if (mostRecent.metadata && mostRecent.metadata.length > 0) {
            const nftData = mostRecent.metadata.find((element: { key: string }) => element.key === '808')
            if (nftData.value['5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47']) {
              if (nftData.value['5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47'].twitterHandle) {
                setTwitterHandle(
                  nftData.value['5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47'].twitterHandle
                )
              }
            }
          }
        }
      })
      .catch((error) => {
        // TODO: Error handling
      })
  }

  useEffect(() => {
    const displayOwner = () => {
      setOwner(null)
      setTwitterHandle(null)
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query {utxos(where: {tokens: {asset: {assetId:{_eq: "${assetId}"}}}}) {address}}`,
        }),
      }

      fetch(dandelionAPI, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.data.utxos.length > 0) {
            setOwner(data.data.utxos[0].address)
            displayChainMetadata(data.data.utxos[0].address)
          } else {
            setOwner('unowned')
          }
        })
        .catch(() => {
          setOwner('apiError')
        })
    }

    const displayMetadata = () => {
      setMetadata(null)
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
      fetch(metadataEndpoint, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          setMetadata(data)
        })
        .catch(() => {
          // TODO: Error Handling
        })
    }

    displayOwner()
    displayMetadata()
  }, [id, assetId, metadataEndpoint])

  /* eslint-disable react/jsx-no-target-blank */
  return (
    <div className="mt-3">
      CryptoMayor{id}
      <div>
        {metadata && (
          <div>
            <h5>{metadata.name}</h5>
            {metadata.image && (
              <img
                alt={`CryptoMayor${id}`}
                className="img-fluid mb-2"
                style={{ maxWidth: '100px', height: 'auto' }}
                src={`https://gateway.pinata.cloud/ipfs/${metadata.image.slice(5)}`}
              />
            )}
          </div>
        )}
        {owner === 'apiError' && (
          <a target="_blank" rel="noopener" href={`https://cryptomayor.io/#/city/${id}`}>
            See additional details here
          </a>
        )}
        {owner === 'unowned' && (
          <a target="_blank" rel="noopener" href={`https://cryptomayor.io/#/city/${id}`}>
            unowned! get it now
          </a>
        )}
        {owner && owner !== 'apiError' && owner !== 'unowned' && (
          <div>
            Owned By:{' '}
            <a target="_blank" rel="noopener" href={`https://pool.pm/${owner}`}>
              {owner.slice(0, 12)}...
            </a>
          </div>
        )}
        {twitterHandle && (
          <a target="_blank" rel="noopener" href={`https://twitter.com/${twitterHandle}`}>
            {twitterHandle} <FaTwitter />
          </a>
        )}
      </div>
    </div>
  )
  /* eslint-enable react/jsx-no-target-blank */
}

function App() {
  return (
    <div className="App">
      <Map />
    </div>
  )
}

export default App
