import React, { StrictMode } from "react";
import { render, waitFor, screen, act, within } from "@testing-library/react";
import { useVideoJS } from "./index";
import { createRoot } from "react-dom/client";

const consoleError = console.error;
console.error = (...err): void => {
  if (err[2] === "(CODE:4 MEDIA_ERR_SRC_NOT_SUPPORTED)") {
    // ignore error related to video file not supported by jsdom
  } else {
    consoleError(...err);
  }
};

function App({ videoId }: { videoId: string }): JSX.Element {
  const videoJsOptions = {
    sources: [{ src: "example.com/oceans.mp4" }],
  };
  const { Video, ready, player } = useVideoJS(videoJsOptions, {
    videoId,
  });
  return (
    <div>
      <div>{ready ? "Ready: true" : "Ready: false"}</div>
      <div>
        {typeof player === "object" && player !== null
          ? "player is object"
          : "player is NOT object but should be"}
      </div>
      <Video />
    </div>
  );
}

test("loads and displays a video", async () => {
  render(<App videoId="1" />);

  await waitFor(() => screen.getByText("Ready: true"));
  expect(screen.getByTitle("Play Video"));
  expect(screen.getByText("Ready: true"));
  expect(screen.getByText("player is object"));
});

test("works with createRoot", async () => {
  render(<div data-testid="root" />);

  const el = screen.getByTestId("root");

  const root = createRoot(el);

  act(() => {
    root.render(
      <StrictMode>
        <App videoId="2" />
      </StrictMode>
    );
  });

  const video = within(await screen.findByTestId("2"));

  await waitFor(() => {
    screen.getByText("Ready: true");
    expect(video.getByTitle("Play Video"));
    expect(screen.getByText("Ready: true"));
    expect(screen.getByText("player is object"));
  });
});

// TODO:
// Supports video children
// Unmounts video on component unmount
// Handles vjs option updates
