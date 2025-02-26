export interface Lugar {
  place_id: number
  licence: string
  osm_type: string
  osm_id: number
  lat: string
  lon: string
  class: string
  type: string
  place_rank: number
  importance: number
  addresstype: string
  name: string
  display_name: string
  address: Address
  extratags: Extratags | null
  boundingbox: string[]
}

export interface Address {
  city: string
  state: string
  'ISO3166-2-lvl4': string
  country: string
  country_code: string
}

export interface Extratags {
  ele: string
  rank: string
  capital: string
  'ref:ine': string
  wikidata: string
  wikipedia: string
  is_capital: string
  population: string
  linked_place: string
  'ine:municipio': string
  'population:date': string
}
