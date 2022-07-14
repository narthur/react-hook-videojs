import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import React, { HTMLProps, Reducer } from "react";

type State = {
  ready: boolean;
  player?: VideoJsPlayer;
  video?: HTMLVideoElement;
  videoJsOptions: VideoJsPlayerOptions;
  options?: {
    classNames?: string;
    videoId?: string;
  };
  props?: Partial<HTMLProps<HTMLVideoElement>>;
  children?: React.ReactNode;
};

type Action = {
  type: "UPDATE";
  payload: Partial<State>;
};

const updateState = (prev: State, next: Partial<State>): State => {
  const keys = Object.keys(next) as Array<keyof State>;
  const changedKeys = keys.filter((key) => {
    if (key === "props") {
      return JSON.stringify(prev[key]) !== JSON.stringify(next[key]);
    }
    return prev[key] !== next[key];
  });

  if (changedKeys.length === 0) {
    return prev;
  }

  return {
    ...prev,
    ...next,
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
