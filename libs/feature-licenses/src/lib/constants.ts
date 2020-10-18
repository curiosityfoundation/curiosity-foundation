import axios from 'axios';
export const HTTPClientURI = 'HTTPClientURI';
export type HTTPClientURI = typeof HTTPClientURI;

export type HTTPClient = {
    [HTTPClientURI]: typeof axios;
}