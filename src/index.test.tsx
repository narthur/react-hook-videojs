import React, { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { useVideoJS } from "./index";
import { createRoot } from "react-dom/client";
import { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";

/* eslint-disable no-console */
const consoleError = console.error;
console.error = (...err): void => {
  if (err[2] === "(CODE:4 MEDIA_ERR_SRC_NOT_SUPPORTED)") {
    // ignore error related to video file not supported by jsdom
  } else {
    consoleError(...err);
  }
};
/* eslint-enable no-console */

function App(props: {
  getOutput?: (p: VideoJsPlayer | undefined) => string;
  videoJsOptions?: VideoJsPlayerOptions;
}): JSX.Element {
  const { Video, ready, player } = useVideoJS({
    sources: [{ src: "example.com/oceans.mp4" }],
    ...props.videoJsOptions,
  });

  const {
    getOutput = (p): string => {
      return typeof p === "object" && p !== null
        ? "player is object"
        : "player is NOT object but should be";
    },
  } = props;

  const output = getOutput(player);

  return (
    <div>
      <div>{ready ? "Ready: true" : "Ready: false"}</div>
      <div>{output}</div>
      <Video />
    </div>
  );
}

test("loads and displays a video", async () => {
  render(<App />);

  await screen.findByText("Ready: true");

  expect(screen.getByTitle("Play Video"));
  expect(screen.getByText("Ready: true"));
  expect(screen.getByText("player is object"));
});

test("works with createRoot", async () => {
  function Concurrent({
    children: c,
  }: {
    children: React.ReactNode;
  }): JSX.Element {
    return <i ref={(l) => l && createRoot(l).render(c)} />;
  }

  render(
    <StrictMode>
      <Concurrent>
        <App />
      </Concurrent>
    </StrictMode>
  );

  await screen.findByText("Ready: true");

  expect(screen.getByTitle("Play Video"));
  expect(screen.getByText("Ready: true"));
  expect(screen.getByText("player is object"));
});

test('handles "src" prop change', async () => {
  function out(p: VideoJsPlayer | undefined): string {
    return p?.src() ?? "";
  }

  const view = render(
    <App
      getOutput={out}
      videoJsOptions={{
        sources: [{ src: "example.com/oceans.mp4" }],
      }}
    />
  );

  await screen.findByText("example.com/oceans.mp4");

  view.rerender(
    <App
      getOutput={out}
      videoJsOptions={{
        sources: [{ src: "example.com/beaches.mp4" }],
      }}
    />
  );

  await expect(
    screen.findByText("example.com/beaches.mp4")
  ).resolves.toBeInTheDocument();
});

// TODO:
// Supports video children
// Handles vjs option updates
