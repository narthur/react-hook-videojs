import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import React, { HTMLProps } from "react";
import { createRoot } from "react-dom/client";

const loadedIds = new Set<string>();

type ReturnType = {
  video: HTMLVideoElement;
  player: VideoJsPlayer;
};

const loadVideoElement = async ({
  videoJsOptions,
  options,
  props,
  children,
  onMount,
  onReady,
}: {
  videoJsOptions: VideoJsPlayerOptions;
  options: {
    classNames?: string;
    videoId: string;
  };
  props?: Partial<HTMLProps<HTMLVideoElement>>;
  children?: React.ReactNode;
  onMount?: (result: ReturnType) => void;
  onReady?: () => void;
}): Promise<ReturnType> => {
  return new Promise((resolve) => {
    const { videoId, classNames = "" } = options || {};
    const changedKey = `${videoId}-${JSON.stringify(videoJsOptions)}`;

    if (loadedIds.has(changedKey)) return;

    loadedIds.add(changedKey);

    const container = document.createElement("div");

    document.body.appendChild(container);

    const mountVideo = (video: HTMLVideoElement | null): void => {
      if (!video) return;
      const player = videojs(video, videoJsOptions, onReady);
      const result = { video, player };

      onMount && onMount(result);
      resolve(result);
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

export default loadVideoElement;
