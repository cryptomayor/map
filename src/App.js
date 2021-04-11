import logo from './logo.svg';
import './App.css';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import ReactMapGL, {Marker, Source, Layer, MapContext, FullscreenControl, Popup} from 'react-map-gl';
import 'bootstrap/dist/css/bootstrap.min.css';
import Coordinates from './coords.js'
import { FaMapPin } from 'react-icons/fa';
import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;




function CustomMarker(props) {
  const context = React.useContext(MapContext);
  
  const {longitude, latitude} = props;

  const [x, y] = context.viewport.project([longitude, latitude]);

  const markerStyle = {
    position: 'absolute',
    background: '#fff',
    left: x,
    top: y
  };

  return (
    <div style={markerStyle} >
      ({longitude}, {latitude})
    </div>
  );
}

const geojson = {
  type: 'FeatureCollection',
  features: [
    {type: 'Feature', geometry: {type: 'Point', coordinates: [-122.4, 37.8]}}
  ]
};

const layerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 10,
    'circle-color': '#007cbf'
  }
};


const parkLayer = {
  id: 'landuse_park',
  type: 'fill',
  source: 'mapbox',
  'source-layer': 'landuse',
  filter: ['==', 'class', 'park']
};



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

  let places = [];
  const markers = [];
  if (mapRef.current) {
    const bounds = mapRef.current.getBounds()
    
    let pins = 0;
    console.log("reloading pins")
    Coordinates.some(function(coordinates) { 
      const key = coordinates[0]
      const lat = coordinates[1]
      const lng = coordinates[2]

      if (bounds.contains([lng, lat])) {
        markers.push(
          <Pin id={key} latitude={lat} longitude={lng} select={select} />
        )
        pins += 1;
      }
      return pins >= 20;
    });
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

    const [owner, setOwner] = React.useState();
    const [metadata, setMetadata] = React.useState();

    const displayOwner = () => {
        setOwner(null)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({'query': `query {utxos(where: {tokens: {_and : [{ policyId: {_eq: "${policyId}"}},{assetName:{_eq: "CryptoMayor${props.id}"}}]}}) {address}}`})
        };
        fetch(dandelionAPI, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log("foo");
                console.log(data);
                if (data.data.utxos.length > 0) {
                  setOwner(data.data.utxos[0].address)
                } else {
                  setOwner('unowned')
                }
            }).catch(error => {
                console.log(error);
            });
    }

    const displayMetadata = () => {
        setMetadata(null)
        const query = `query {
          transactions(
            where: {
              mint: {
                _and: [
                  { 
                    assetName: {
                      _eq: "CryptoMayor${props.id}"
                    }
                  }
                  {
                    policyId: {
                      _eq: "${policyId}"
                    }
                  }
                ]
              }
            }
          ) {
            metadata { value }
          }
        }`
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({'query': query})
        };
        fetch(dandelionAPI, requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log("foo");
                console.log(data);
                if (data.data.transactions.length > 0) {
                  const tokenMetadata = data.data.transactions[0].metadata[0].value[policyId][`CryptoMayor${props.id}`]
                  console.log(tokenMetadata);
                  setMetadata(tokenMetadata)
                }
            }).catch(error => {
                console.log(error);
            });
    }

    useEffect(() => {
      console.log(props.id);
      displayOwner();
      displayMetadata();
    }, [props.id]);

    return (
      <div class="mt-3">
          CryptoMayor{props.id}
          <div>
            { metadata && (
                <div>
                  <h5>{ metadata.name }</h5>
                  <img class="img-fluid mb-2" style={{maxWidth: "100px", height: "auto"}} src={`https://ipfs.blockfrost.dev/ipfs/${metadata.image.slice(5)}`} />
                </div>
              )
            }
            { owner === "unowned" && <a target="_blank" href={`https://cryptomayor.io/#/city/${props.id}`}>unowned! get it now</a> }
            { owner && owner !== "unowned" && <div>Owned By: <a target="_blank" href={`https://pool.pm/${owner}`}>{owner.slice(0, 12)}...</a></div> }
          </div>
      </div>
    )
}

function App() {
  return (
    <div className="App">
      <Map />
    </div>
  );
}

export default App;
