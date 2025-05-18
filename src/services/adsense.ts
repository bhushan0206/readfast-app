import ReactGA from 'react-google-adsense';

export const initializeAdsense = () => {
  ReactGA.initialize(import.meta.env.VITE_ADSENSE_CLIENT_ID);
};

export const AdUnit = ({ slot }: { slot: string }) => (
  <ReactGA.GoogleAdSense
    client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
    slot={slot}
    style={{ display: 'block' }}
    format="auto"
    responsive="true"
  />
);