import './App.css';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import ReactMapGL, {Marker, FullscreenControl, Popup} from 'react-map-gl';
import 'bootstrap/dist/css/bootstrap.min.css';
import Coordinates from './coords.js'
import { FaMapPin, FaTwitter } from 'react-icons/fa';
import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const fullscreenControlStyle= {
  right: 10,
  top: 10
};

function Pin(props) {
      return(
        <Marker key={props.id} offsetTop={-30} offsetLeft={-15} longitude={props.longitude} latitude={props.latitude} >
          <FaMapPin size={30} onClick={() => props.select({ id: props.id, latitude: props.latitude, longitude: props.longitude })} />
        </Marker>
      );
}


function Map() {
  const mapRef = useRef();
  const [viewport, setViewport] = useState({
    width: 400,
    height: 400,
    latitude: 35.27517,
    longitude: 43.59593,
    zoom: 1
  });

  const select = function(location) {
    setLocation(location);
    togglePopup(true);
  }

  const markers = [];
  if (mapRef.current) {
    const bounds = mapRef.current.getBounds()
    
    let pins = 0;
    console.log("reloading pins")
    for (let coordinates of Coordinates) { 
      const key = coordinates[0]
      const lat = coordinates[1]
      const lng = coordinates[2]

      if (bounds.contains([lng, lat])) {
        markers.push(
          <Pin id={key} key={key} latitude={lat} longitude={lng} select={select} />
        )
        pins += 1;
      }

      if (pins >= 20) {
        break
      }
    }
  }

  const [location, setLocation] = React.useState();
  const [showPopup, togglePopup] = React.useState(false);


  const onLoad = () => {
    console.log('mapRef.current is ready for use', mapRef.current.getBounds());
  }

  return (

    <ReactMapGL {...viewport} 
        width="100vw" 
        height="100vh"
        onViewportChange={setViewport}
        ref={ref => mapRef.current = ref && ref.getMap()}
        onLoad={onLoad}
        mapboxApiAccessToken="pk.eyJ1IjoiY3J5cHRvbWF5b3IiLCJhIjoiY2tuYzh5bHAwMGJocjJvcnpzdGltdmZtOSJ9.H5wrB8rdRFgzgKbtPi3z5Q"
    >
      <FullscreenControl style={fullscreenControlStyle} />
      { markers }
      {showPopup && <Popup
        latitude={location.latitude}
        longitude={location.longitude}
        closeButton={true}
        closeOnClick={false}
        onClose={() => togglePopup(false)}
        anchor="top" >
        <Token id={location.id} />
      </Popup>}
    </ReactMapGL>
  );
}

function Token(props) {

    const policyId = '5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47';
    const dandelionAPI = 'https://graphql-api.mainnet.dandelion.link'
    const metadataEndpoint = `metadata/CryptoMayor${props.id}`

    const [owner, setOwner] = React.useState();
    const [metadata, setMetadata] = React.useState();
    const [twitterHandle, setTwitterHandle] = React.useState('');
    const assetId = policyId + `CryptoMayor${props.id}`.split("").map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join("");

    const displayChainMetadata = (forOwner) => {
        const query = JSON.stringify({'query': `query {transactions(where: {_and: [{inputs: {address: {_eq: "${forOwner}"}}}{outputs: {address: {_eq: "${forOwner}"}}}]}) {metadata {key, value}, outputs {address}, includedAt, inputs {tokens {asset {fingerprint, assetId, assetName}}}}}`})
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: query,
        };
        fetch(dandelionAPI, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.data.transactions.length > 0) {
                  const sortedList = data.data.transactions.sort((a, b) => (a.includedAt > b.includedAt) ? 1 : -1)
                  const mostRecent = sortedList[sortedList.length - 1]
                  if (mostRecent.metadata && mostRecent.metadata.length > 0) {
                      const nftData = mostRecent.metadata.find(element => element.key === "808");
                      if (nftData.value["5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47"]) {
                          if (nftData.value["5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47"].twitterHandle) {
                            setTwitterHandle(nftData.value["5e889bcb83b884bb6d768cfc483845cd6ccee79c2b5a4a15dae7ff47"].twitterHandle);
                          }
                      }
                  }
                }
            }).catch(error => {
                console.log(error);
            });
    }

    useEffect(() => {
      const displayOwner = () => {
        setOwner(null)
        setTwitterHandle(null)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({'query': `query {utxos(where: {tokens: {asset: {assetId:{_eq: "${assetId}"}}}}) {address}}`})
        };
        fetch(dandelionAPI, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log("foo");
                console.log(data);
                if (data.data.utxos.length > 0) {
                  setOwner(data.data.utxos[0].address)
                  displayChainMetadata(data.data.utxos[0].address)
                } else {
                  setOwner('unowned')
                }
            }).catch(error => {
                console.log(error);
                setOwner("apiError");
            });
    }

      const displayMetadata = () => {
        setMetadata(null)
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        };
        fetch(metadataEndpoint, requestOptions)
            .then(response => response.json())
            .then(data => {
                setMetadata(data)
            }).catch(error => {
                console.log(error);
            });
      }

      displayOwner();
      displayMetadata();
    }, [props.id, assetId, metadataEndpoint]);

    /* eslint-disable react/jsx-no-target-blank */
    return (
      <div className="mt-3">
          CryptoMayor{props.id}
          <div>
            { metadata && (
                <div>
                  <h5>{ metadata.name }</h5>
                  <img alt={`CryptoMayor${props.id}`} class="img-fluid mb-2" style={{maxWidth: "100px", height: "auto"}} src={`https://gateway.pinata.cloud/ipfs/${metadata.image.slice(5)}`} />
                </div>
              )
            }
            { owner === "apiError" && <a target="_blank" rel="noopener" href={`https://cryptomayor.io/#/city/${props.id}`}>See additional details here</a> }
            { owner === "unowned" && <a target="_blank" rel="noopener" href={`https://cryptomayor.io/#/city/${props.id}`}>unowned! get it now</a> }
            { owner && owner !== "apiError" && owner !== "unowned" && <div>Owned By: <a target="_blank" rel="noopener" href={`https://pool.pm/${owner}`}>{owner.slice(0, 12)}...</a></div> }
            { twitterHandle && <a target="_blank" rel="noopener" href={`https://twitter.com/${twitterHandle}`}>{twitterHandle} <FaTwitter /></a> }
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
  );
}

export default App;
