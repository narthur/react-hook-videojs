import React, { useEffect, useCallback, HTMLProps, useReducer } from "react";
import videojs, { VideoJsPlayerOptions } from "video.js";
import reducer from "./index.reducer";
import loadVideoElement from "./lib/mountVideo";

type VideoType = (
  props: {
    children?: React.ReactNode;
  } & Partial<HTMLProps<HTMLVideoElement>>
) => JSX.Element;

export const useVideoJS = (
  videoJsOptions: VideoJsPlayerOptions,
  options: {
    classNames?: string;
    videoId?: string;
  } = {}
): {
  Video: VideoType;
  ready: boolean;
  player?: videojs.Player;
} => {
  const [state, dispatch] = useReducer(reducer, {
    ready: false,
    videoJsOptions,
    options,
  });
  const { video, player, ready } = state;

  const Video = useCallback<VideoType>(
    ({ children, ...props }) => {
      useEffect(() => {
        void loadVideoElement({
          videoJsOptions,
          options,
          props,
          children,
        }).then((result) => {
          result.player.ready(() => {
            dispatch({
              type: "UPDATE",
              payload: {
                ready: true,
              },
            });
          });
          dispatch({ type: "UPDATE", payload: result });
        });
      }, []);

      useEffect(() => {
        dispatch({ type: "UPDATE", payload: { children, props } });
      }, [children, props]);

      return (
        <div
          ref={(el): void => {
            if (!el || !video) return;
            el.appendChild(video);
          }}
        />
      );
    },
    [video, player]
  );

  return { Video, ready, player };
};
