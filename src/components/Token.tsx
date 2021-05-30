import { useState, useEffect } from 'react'
import { FaTwitter } from 'react-icons/fa'
import { Metadata } from '../common/types'
import styled from '@emotion/styled'

const Container = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;

  div,
  a {
    margin-top: 1rem;
  }

  a {
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
    color: #6641bd;
  }
`

const CryptoMayorIDHeader = styled.span`
  margin-bottom: 0;
`

const LocationName = styled.h3`
  margin-top: 0.3rem;
  margin-bottom: 0.5rem;
`

const TokenImage = styled.img`
  max-width: 100px;
  height: auto;
`

const Token = ({ id }: { id: number }) => {
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
    <Container>
      <CryptoMayorIDHeader>CryptoMayor{id}</CryptoMayorIDHeader>
      {metadata && (
        <>
          <LocationName>{metadata.name}</LocationName>
          {metadata.image && (
            <TokenImage alt={`CryptoMayor${id}`} src={`https://gateway.pinata.cloud/ipfs/${metadata.image.slice(5)}`} />
          )}
        </>
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
    </Container>
  )
  /* eslint-enable react/jsx-no-target-blank */
}

export default Token
