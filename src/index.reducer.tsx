import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import React, { HTMLProps, Reducer } from "react";

type State = {
  ready: boolean;
  player?: VideoJsPlayer;
  video?: HTMLVideoElement;
  videoJsOptions: VideoJsPlayerOptions;
  options: {
    classNames: string;
    videoId: string;
  };
  props?: Partial<HTMLProps<HTMLVideoElement>>;
  children?: React.ReactNode;
};

type Delta = Partial<State>;

type Action = {
  type: "UPDATE";
  payload: Delta;
};

const updateState = (s: State, d: Delta): State => {
  const keys = Object.keys(d) as Array<keyof State>;
  const changed = keys.filter((k) => {
    if (["props", "videoJsOptions"].includes(k)) {
      return JSON.stringify(s[k]) !== JSON.stringify(d[k]);
    }
    return s[k] !== d[k];
  });

  if (changed.length === 0) {
    return s;
  }

  if (changed.includes("videoJsOptions")) {
    const src = d?.videoJsOptions?.sources;
    src && s.player?.src(src);
  }

  return {
    ...s,
    ...d,
  };
};

const reducer: Reducer<State, Action> = (
  state: State,
  action: Action
): State => {
  switch (action.type) {
    case "UPDATE":
      return updateState(state, action.payload);
    default:
      return state;
  }
};

export default reducer;
