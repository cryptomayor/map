import { FaMapPin } from 'react-icons/fa'
import { Marker } from 'react-map-gl'
import { Location } from '../common/types'

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

export default Pin
