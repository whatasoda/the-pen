import { useMemo } from 'react';

declare global {
  interface Window {
    AudioContext: AudioContext;
    webkitAudioContext?: AudioContext;
  }
}
window.AudioContext = window.AudioContext || window.webkitAudioContext;

const useAudioContext = () => useMemo(() => new AudioContext(), []);

export default useAudioContext;
