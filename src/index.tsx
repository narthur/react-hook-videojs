import React, { useEffect, useCallback, HTMLProps, useReducer } from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { createRoot } from "react-dom/client";
import reducer from "./index.reducer";

type VideoType = (
  props: {
    children?: React.ReactNode;
  } & Partial<HTMLProps<HTMLVideoElement>>
) => JSX.Element;

const loadedIds = new Set<string>();

const loadVideoElement = async ({
  videoJsOptions,
  options,
  props,
  children,
}: {
  videoJsOptions: VideoJsPlayerOptions;
  options: {
    classNames?: string;
    videoId?: string;
  };
  props?: Partial<HTMLProps<HTMLVideoElement>>;
  children?: React.ReactNode;
}): Promise<{
  video: HTMLVideoElement;
  player: VideoJsPlayer;
}> => {
  return new Promise((resolve) => {
    const { videoId = "video", classNames = "" } = options || {};
    const changedKey = `${videoId}-${JSON.stringify(videoJsOptions)}`;

    if (loadedIds.has(changedKey)) return;

    loadedIds.add(changedKey);

    const container = document.createElement("div");

    document.body.appendChild(container);

    const mountVideo = (video: HTMLVideoElement | null): void => {
      if (!video) return;
      const player = videojs(video, videoJsOptions);
      resolve({ video, player });
    };

    const root = createRoot(container);

    root.render(
      <div data-testid={videoId} data-vjs-player key={changedKey}>
        {/* Disabled since we want to allow the user to use any valid <video> prop */}
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <video className={`video-js ${classNames}`} ref={mountVideo} {...props}>
          {children}
        </video>
      </div>
    );
  });
};

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
