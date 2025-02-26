export interface PageID {
  batchcomplete: string;
  query:         Query;
}

export interface Query {
  geosearch: Geosearch[];
}

export interface Geosearch {
  pageid:  number;
  ns:      number;
  title:   string;
  lat:     number;
  lon:     number;
  dist:    number;
  primary: string;
}
