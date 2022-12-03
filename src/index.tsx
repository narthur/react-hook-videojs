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
    options: {
      classNames: options.classNames ?? "",
      videoId: options.videoId ?? Math.random().toString(),
    },
  });
  const { video, player, ready } = state;

  useEffect(() => {
    dispatch({ type: "UPDATE", payload: { videoJsOptions } });
  }, [videoJsOptions]);

  const Video = useCallback<VideoType>(
    ({ children, ...props }) => {
      useEffect(() => {
        void loadVideoElement({
          ...state,
          props,
          children,
          onMount: (result) => {
            dispatch({ type: "UPDATE", payload: result });
          },
          onReady: () => {
            dispatch({
              type: "UPDATE",
              payload: {
                ready: true,
              },
            });
          },
        });

        return () => {
          if (player && !player.isDisposed()) {
            player.dispose();
          }
        };
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
