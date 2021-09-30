import { useCallback, useEffect, useRef } from "preact/hooks";
import { isIOS } from "../utils/browser";

import { noop } from "../utils/common";

import src from "../assets/alarm.mp3";

type AudioObj = {
  ctx: AudioContext;
  gainNode: GainNode;
  elem: HTMLAudioElement;
};

export const useAlarm = (
  enabled: boolean,
  handleFinish: () => void
): (() => void) => {
  const audioObj = useRef<AudioObj>(null);

  useEffect(() => {
    const audioElement = new Audio();

    const audioCtx = new AudioContext();

    const gainNode = audioCtx.createGain();

    const track = audioCtx.createMediaElementSource(audioElement);
    track.connect(gainNode).connect(audioCtx.destination);

    const newAudioObj: AudioObj = {
      ctx: audioCtx,
      gainNode,
      elem: audioElement,
    };

    audioObj.current = newAudioObj;

    return () => {
      audioCtx.close();
    };
  }, []);

  const init = useCallback(() => {
    const audioElem = audioObj.current?.elem;
    const ganiNode = audioObj.current?.gainNode;
    if (audioElem && ganiNode) {
      if (audioElem.muted) {
        audioElem.muted = false;
      }

      if (isIOS()) {
        audioElem.play();
      }

      audioElem.src = src;

      ganiNode.gain.value = 1;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      if (audioObj.current?.ctx.state === "suspended") {
        audioObj.current.ctx.resume();
      }

      const audioElem = audioObj.current?.elem;
      if (audioElem) {
        audioElem.play();
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!audioObj.current) return noop;

    audioObj.current.elem.addEventListener("ended", handleFinish);

    return () => {
      audioObj.current?.elem.removeEventListener("ended", handleFinish);
    };
  }, [handleFinish]);

  return init;
};
