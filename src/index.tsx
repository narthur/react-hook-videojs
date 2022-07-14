import React, {
  useEffect,
  useCallback,
  HTMLProps,
  useReducer,
  Reducer,
} from "react";
import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import { createRoot } from "react-dom/client";

type VideoType = (
  props: {
    children?: React.ReactNode;
  } & Partial<HTMLProps<HTMLVideoElement>>
) => JSX.Element;

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
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <video className={`video-js ${classNames}`} ref={mountVideo} {...props}>
          {children}
        </video>
      </div>
    );
  });
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

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "UPDATE":
      return updateState(state, action.payload);
    default:
      return state;
  }
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
  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, {
    ready: false,
    videoJsOptions,
    options,
  });
  const { video, player, ready } = state;

  const Video = useCallback<VideoType>(
    ({ children, ...props }) => {
      useEffect(() => {
        if (player) return;
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
      }, [player]);

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
