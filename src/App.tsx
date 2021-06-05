import Map from './components/Map'
import mapboxgl from 'mapbox-gl'

// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default

function App() {
  return (
    <div>
      <Map />
    </div>
  )
}

export default App
