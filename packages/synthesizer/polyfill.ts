declare global {
  interface Window {
    AudioContext: AudioContext;
    webkitAudioContext?: AudioContext;
  }
}

window.AudioContext = window.AudioContext || window.webkitAudioContext;

export default {};
