import { MotionNode } from './base';
import createHostMotionTree, { HostMotionTree } from './host';
import createPlayerMotionTree, { PlayerMotionTree } from './player';

export { createHostMotionTree, createPlayerMotionTree, MotionNode, HostMotionTree, PlayerMotionTree };

type MotionTree = ReturnType<typeof createHostMotionTree> | ReturnType<typeof createPlayerMotionTree>;

export default MotionTree;
