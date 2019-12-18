interface MIDIInput {}

declare module '*.sf2' {
  import { SoundFontJSONData } from 'sf2-loader';
  const data: SoundFontJSONData;
  export = data;
}

declare module '*.m4a' {
  const _path: string;
  export default _path;
}

declare module 'adsr-gain-node' {
  export = AdsrGainNode;
  class AdsrGainNode {
    ctx: BaseAudioContext;
    mode: 'exponentialRampToValueAtTime' | 'linearRampToValueAtTime';
    constructor(ctx: BaseAudioContext);
    setOptions(options: AdsrGainNode.Options): void;
    getGainNode(audioTime: number): GainNode;
    releaseNow(): void;
    releaseTime(): number;
    releaseTimeNow(): number;
    disconnect(disconnectTime: number): void;
  }

  namespace AdsrGainNode {
    interface Options {
      attackAmp?: number;
      decayAmp?: number;
      sustainAmp?: number;
      releaseAmp?: number;
      attackTime?: number;
      decayTime?: number;
      sustainTime?: number;
      releaseTime?: number;

      /**
       * If you are making e.g. a keyboard, then you may
       * not auto-release the note
       * If auto release is false then
       * you should release the note using.
       * `adsr.releaseNow()´
       */
      autoRelease?: boolean;
    }
  }
}

// declare module 'sample-player' {
//   export = player;
//   const player: (ctx: AudioContext, source: Record<string, string>, options: player.Options) => SamplePlayer;

//   interface SamplePlayer {
//     play: SamplePlayer['start'];
//     start(name: player.Note, when?: number, options?: player.Options): AudioNode;
//     stop(when?: number, nodes?: AudioNode[]): number[];
//     connect(destination: AudioDestinationNode): this;
//     on<T extends player.SamplePlayerEventType>(event: T, callback: player.SamplePlayerEventHandler<T>): this;
//     schedule(when: number, source: player.SamplePlayerScheduledItem[]): number[];
//     listenToMidi(input: MIDIInput, options?: player.Options): this;
//   }

//   namespace player {
//     type Note = number | string;
//     type SamplePlayerEventType = keyof SamplePlayerEventObjectMap;
//     interface SamplePlayerEventObjectMap {
//       start: Note;
//       started: number;
//       stop: Note;
//       ended: number;
//     }
//     type SamplePlayerEventHandler<T extends SamplePlayerEventType> = (
//       when: number,
//       name: SamplePlayerEventObjectMap[T],
//       options: Options,
//     ) => void;

//     type SamplePlayerScheduledItem = [number, Note];

//     interface Options {
//       /**
//        * the gain (volume) of the player (1 by default)
//        */
//       gain?: number;
//       /**
//        * the attack time of the amplitude envelope
//        */
//       attack?: number;
//       /**
//        * the decay time of the amplitude envelope
//        */
//       decay?: number;
//       /**
//        * the sustain gain value of the amplitude envelope
//        */
//       sustain?: number;
//       /**
//        * the release time of the amplitude envelope
//        */
//       release?: number;
//       /**
//        * the amplitude envelope as array of [attack, decay, sustain, release]. It overrides other options.
//        */
//       adsr?: [number, number, number, number];
//       /**
//        * set to true to loop audio buffers
//        */
//       loop?: boolean;
//     }
//   }
// }
