import React, { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { useVideoJS } from "./index";
import { createRoot } from "react-dom/client";

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

function App(): JSX.Element {
  const videoJsOptions = {
    sources: [{ src: "example.com/oceans.mp4" }],
  };
  const { Video, ready, player } = useVideoJS(videoJsOptions);
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
  render(<App />);

  await screen.findByText("Ready: true");

  expect(screen.getByTitle("Play Video"));
  expect(screen.getByText("Ready: true"));
  expect(screen.getByText("player is object"));
});

test("works with createRoot", async () => {
  function Concurrent({
    children,
  }: {
    children: React.ReactNode;
  }): JSX.Element {
    return (
      <div
        ref={(el): void => {
          if (!el) return;
          createRoot(el).render(children);
        }}
      />
    );
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

// TODO:
// Supports video children
// Unmounts video on component unmount
// Handles vjs option updates
