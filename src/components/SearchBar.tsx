import styled from '@emotion/styled/macro'
import { ReactComponent as SearchIcon } from '../static/icons/magnifying-glass.svg'

const SearchInput = styled.input`
  border: none;
  background: none;
  margin: 0;
  outline: none;
  color: 000;
  font-size: 1.2rem;
  transition: 0.4s;
  line-height: 1000px;
  width: 0vw;
  height: 100%;
  padding: 0;
`

const Container = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
  background-color: #fff;
  padding: 0.4rem;
  border-radius: 2rem;
  border: 1px solid #000;
  box-sizing: border-box;
  height: 40px;

  &:hover ${SearchInput} {
    width: 20vw;
    padding-left: 0.5rem;
    @media screen and (max-width: 1024px) {
      width: 50vw;
    }
  }
`

const SearchIconContainer = styled(SearchIcon)`
  height: 90%;
`

const SearchBar = () => {
  return (
    <Container>
      <SearchInput type="text" />
      <SearchIconContainer fill="#000" />
    </Container>
  )
}

export default SearchBar
