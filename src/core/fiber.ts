import { useMemo } from 'react';
import AdsrGainNode from 'adsr-gain-node';

const useFiber = (registerNode: AudioRoot['registerNode']) => {
  return useMemo(() => createFiberObject(registerNode), [registerNode]);
};

const createFiberObject = (registerNode: AudioRoot['registerNode']) => {
  const registry: Record<string, ReturnType<typeof add> extends Promise<infer T> ? T : never> = {};

  const add = async (type: 'attack' | 'curve' | 'liner', freq: number, axis: V3) => {
    const item = await registerNode((ctx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();

      const play = (() => {
        if (type === 'attack') return createAttack(osc, gain);
        if (type === 'curve') return createCurve(osc, gain);
        if (type === 'liner') return createLiner(osc, gain);
        return (_: MotionPayload) => {};
      })();
      return [{ axis, gain: gain.gain, play }, osc, gain] as const;
    });
    registry[`${type}: ${freq}`] = item;
    return item;
  };

  const update = (_: V3, params: MotionPayload) => {
    Object.values(registry).forEach(({ play }) => play(params));
  };

  return { update, add };
};

const createAttack = (source: AudioScheduledSourceNode, destination: AudioNode) => {
  const ctx = source.context;
  let isPlaying = false;
  const adsr = new AdsrGainNode(ctx);
  return ({ power, attack }: MotionPayload) => {
    if (attack < 0.8 || isPlaying) return;
    isPlaying = true;
    const volume = Math.max(power, 0.2) - 0.2;
    adsr.setOptions({
      attackAmp: volume,
      decayAmp: volume * 0.6,
      sustainAmp: volume * 0.4,
      releaseAmp: 0.00001,
      attackTime: 0.005,
      decayTime: 0.2,
      sustainTime: 0.1,
      releaseTime: 0.3,
      autoRelease: true,
    });
    const node = adsr.getGainNode(ctx.currentTime);
    source.connect(node);
    node.connect(destination);
    const releaseTime = adsr.releaseTime();
    setTimeout(() => {
      isPlaying = false;
      source.disconnect(node);
      node.disconnect(destination);
    }, (releaseTime - 0.2) * 1000);
  };
};

const createCurve = (source: AudioScheduledSourceNode, destination: AudioNode) => {
  const ctx = source.context;
  const adsr = new AdsrGainNode(ctx);
  let isPlaying = false;
  let node: GainNode | null = null;
  let count = 0;
  return ({ power, curve }: MotionPayload) => {
    if (curve < 0.001) {
      count = Math.max(count - 1, 0);
      if (isPlaying && !count) {
        adsr.releaseNow();
        isPlaying = false;
        if (node) {
          source.disconnect(node);
          node.disconnect(destination);
        }
      }
      return;
    }
    count = 20;
    if (isPlaying) return;

    isPlaying = true;
    const volume = power;
    adsr.setOptions({
      attackAmp: volume,
      decayAmp: volume * 0.8,
      sustainAmp: volume * 0.4,
      releaseAmp: 0.0001,
      attackTime: 0.2,
      decayTime: 0.5,
      sustainTime: 0.8,
      releaseTime: 1,
      autoRelease: false,
    });
    node = adsr.getGainNode(ctx.currentTime);
    source.connect(node);
    node.connect(destination);
  };
};

const createLiner = (source: AudioScheduledSourceNode, destination: AudioNode) => {
  const ctx = source.context;
  const adsr = new AdsrGainNode(ctx);
  let isPlaying = false;
  let node: GainNode | null = null;
  let count = 0;
  return ({ power, liner }: MotionPayload) => {
    if (liner < 0.4) {
      count = Math.max(count - 1, 0);
      if (isPlaying && !count) {
        adsr.releaseNow();
        isPlaying = false;
        if (node) {
          source.disconnect(node);
          node.disconnect(destination);
        }
      }
      return;
    }
    count = 10;
    if (isPlaying) return;

    isPlaying = true;
    const volume = power;
    adsr.setOptions({
      attackAmp: volume,
      decayAmp: volume * 0.8,
      sustainAmp: volume * 0.4,
      releaseAmp: 0.0001,
      attackTime: 0.2,
      decayTime: 0.5,
      sustainTime: 0.8,
      releaseTime: 1,
      autoRelease: false,
    });
    node = adsr.getGainNode(ctx.currentTime);
    source.connect(node);
    node.connect(destination);
  };
};

export default useFiber;
