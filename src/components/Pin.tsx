import { FaMapPin } from 'react-icons/fa'
import { Marker } from 'react-map-gl'
import { CryptoMayorLocation } from '../common/types'

interface PinProps {
  location: CryptoMayorLocation
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

export default Pin
