/* eslint-disable prettier/prettier */
import vn from 'vector-node';
import createEnvelope, { EnvelopeProps } from '../utils/envelope';

export interface NoteAttributes {
  source: AudioNode;
  destination: AudioNode;
  envelope: EnvelopeProps;
  /**
   * The node use this callback to define duration of sound playing.
   */
  calcDuration: (velocity: number) => number;
}

const Note = vn.defineNode(
  {
    inputs: {
      velocity: 'f32-2',
      timeline: 'f32-2',
      dt: 'f32-1',
    },
    outputs: {},
    events: {
      end: () => true,
    },
  },
  ({ cleanup }, _, { source, envelope, destination }: NoteAttributes) => {
    let active = false;
    const { context: ctx } = source;
    const ADSR = createEnvelope(envelope, 100);
    const gain = ctx.createGain();

    source.connect(gain);
    gain.connect(destination);
    gain.gain.value = 0;

    cleanup(() => {
      source.disconnect(gain);
      gain.disconnect();
      stop(0);
    });

    const start = (offset: number) => ADSR.start(gain.gain, ctx.currentTime + offset);
    const stop = (offset: number) => ADSR.stop(gain.gain, ctx.currentTime + offset);

    return ({ i }) => {
      const velocity = i.velocity[0];
      const dt = i.dt[0];
      const { timeline } = i;
      if (isNaN(velocity) || !isFinite(velocity)) return;

      if (velocity > 0 && !active) {
        active = true;
        start(dt * timeline[0]);
      }
      if (timeline[1] !== 1 && active) {
        active = false;
        stop(dt * timeline[1]);
      }
    };
  },
)({});

export default Note;
