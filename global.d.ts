// global.d.ts
interface Window {
    webkitAudioContext: typeof AudioContext;
    transferToAgent: (name: string) => void;
    hengUpAgent: (name: string) => void;
  }
 