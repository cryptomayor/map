import SearchInput from './SearchInput'
import { debounce } from 'debounce'
import { useCallback, useMemo, useState } from 'react'
import styled from '@emotion/styled'
import { SEARCH_FONT_COLOR } from '../common/consts'

const searchAPIEndpoint = (term: string) => `https://tokens.cryptomayor.io/tokens/${term}`

const SearchBarContainer = styled.div`
  position: fixed;
  top: 1.5vh;
  left: 1vw;
  z-index: 99999;
`

type SearchResultData = {
  id: string
  name: string
}

const SearchResults = styled.ul`
  color: ${SEARCH_FONT_COLOR};
  font-size: 0.9rem;
  background-color: #fff;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style-type: none;
  border-radius: 0.3rem;
  box-sizing: border-box;
  cursor: pointer;
  overflow: hidden;
`

const getLocationIDFromSearchResultID = (id: string) => {
  const matchId = id.match(/\d+/)
  const idString = matchId ? matchId[0] : '-1'
  return parseInt(idString)
}

const SearchResult = styled.li`
  padding: 0.5rem;

  &:hover {
    background-color: #f5f5f5f5;
  }
`

interface SearchBarProps {
  coordinates: Map<number, number[]>
  onSearchSelected: (id: number) => void
}

const SearchBar = ({ coordinates, onSearchSelected }: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultData[] | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        if (term === '') {
          setSearchResults(null)
          return
        }

        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }

        fetch(searchAPIEndpoint(term), requestOptions)
          .then((response) => response.json())
          .then((data) => {
            const results = data.filter((result: SearchResultData) => {
              const id = getLocationIDFromSearchResultID(result.id)
              if (id && id !== -1) {
                return coordinates.has(id)
              }

              return false
            })
            setSearchResults(results.slice(0, 20))
          })
      }, 200),
    [coordinates]
  )

  const onSearch = useCallback(
    (newTerm: string) => {
      setSearchTerm(newTerm)
      debouncedSearch(newTerm)
    },
    [debouncedSearch]
  )

  return (
    <SearchBarContainer
      onMouseLeave={() => {
        setIsOpen(false)
      }}
      onMouseEnter={() => {
        setIsOpen(true)
      }}
    >
      <SearchInput onTermChange={onSearch} term={searchTerm} isOpen={isOpen} />
      {isOpen && searchResults && (
        <SearchResults>
          {searchResults.map(({ id, name }) => {
            return (
              <SearchResult key={id} onClick={() => onSearchSelected(getLocationIDFromSearchResultID(id))}>
                {name}
              </SearchResult>
            )
          })}
        </SearchResults>
      )}
    </SearchBarContainer>
  )
}

export default SearchBar
