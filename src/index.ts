import init from './init';

if (typeof window !== 'undefined') {
  (window as any).AudioContext = AudioContext || (window as any).webkitAudioContext;
}

init();
