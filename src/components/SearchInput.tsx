import styled from '@emotion/styled/macro'
import { ChangeEvent } from 'react'
import { SEARCH_FONT_COLOR } from '../common/consts'
import { ReactComponent as SearchIcon } from '../static/icons/magnifying-glass.svg'

type InputFieldProps = {
  isOpen: boolean
}

const InputField = styled.input<InputFieldProps>`
  border: none;
  background: none;
  margin: 0;
  outline: none;
  color: ${SEARCH_FONT_COLOR};
  font-size: 1rem;
  transition: 0.4s;
  width: ${(props) => (props.isOpen ? '18vw' : '0')};
  height: 100%;
  padding: 0;

  @media screen and (max-width: 1024px) {
    width: ${(props) => (props.isOpen ? '48vw' : '0')};
  }
`

type ContainerProps = {
  isOpen: boolean
}

const Container = styled.div<ContainerProps>`
  display: flex;
  justify-content: center;
  position: relative;
  background-color: #fff;
  padding: 0.3rem;
  border-radius: 0.6rem;
  border: 1px solid ${SEARCH_FONT_COLOR};
  box-sizing: border-box;
  height: 40px;
  transition: 0.4s;
  width: ${(props) => (props.isOpen ? '20vw' : '2vw')};
  min-width: 40px;

  @media screen and (max-width: 1024px) {
    width: ${(props) => (props.isOpen ? '50vw' : '2vw')};
  }
`

const SearchIconContainer = styled(SearchIcon)`
  height: 90%;
  float: right;
  &:hover {
    cursor: pointer;
  }
`

interface SearchBarProps {
  onTermChange: (newTerm: string) => void
  term: string
  isOpen: boolean
}

const SearchBar = ({ onTermChange, term, isOpen }: SearchBarProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onTermChange(e.target.value)
  }

  return (
    <Container isOpen={isOpen}>
      <InputField type="text" onChange={handleChange} value={term} isOpen={isOpen} />
      <SearchIconContainer fill={SEARCH_FONT_COLOR} />
    </Container>
  )
}

export default SearchBar
