import axios from 'axios';
const BASE_URL = process.env.REACT_APP_BASE_URL;


export const startEmotionDetection = async () => {
  return await axios.get(`${BASE_URL}/start`);
};

export const stopEmotionDetection = async () => {
  return await axios.get(`${BASE_URL}/stop`);
};

export const getVideoFeedUrl = () => {
  return `${BASE_URL}/video-emotion-detection?t=${new Date().getTime()}`;
};
