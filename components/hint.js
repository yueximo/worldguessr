import { useEffect, useState, useRef } from "react";
import useWindowDimensions from "./useWindowDimensions";

const HINT_REFRESH_MS = 30000; // refresh hint every 30 seconds

function findHintType(screenW, screenH, types, vertThresh) {
  let type = 0;
  for (let i = 0; i < types.length; i++) {
    if (types[i][0] <= screenW * 0.9 && types[i][1] <= screenH * vertThresh) {
      type = i;
    }
  }

  if (types[type][0] > screenW || types[type][1] > screenH * vertThresh)
    return -1;

  return type;
}

export default function Hint({
  types,
  centerOnOverflow,
  vertThresh = 0.3,
  screenW,
  screenH,
  showHintText = true,
  locationHint = null,
}) {
  const [type, setType] = useState(
    findHintType(screenW, screenH, types, vertThresh)
  );
  const [hint, setHint] = useState(locationHint || "No hint available");
  const hintDivRef = useRef(null);
  const lastRefresh = useRef(0);

  useEffect(() => {
    setType(findHintType(screenW, screenH, types, vertThresh));
  }, [screenW, screenH, JSON.stringify(types), vertThresh]);

  useEffect(() => {
    // Update hint when locationHint changes
    if (locationHint) {
      setHint(locationHint);
    }
  }, [locationHint]);


  useEffect(() => {
    lastRefresh.current = 0;
  }, [type]);

  useEffect(() => {
    const displayNewHint = () => {
      if (type === -1) return;
      setTimeout(() => {
        const isHintDivVisible =
          hintDivRef.current &&
          hintDivRef.current.getBoundingClientRect().top < window.innerHeight &&
          hintDivRef.current.getBoundingClientRect().bottom > 0;

        if (
          isHintDivVisible &&
          Date.now() - lastRefresh.current > HINT_REFRESH_MS &&
          !locationHint // Only show random hints if no location hint is available
        ) {
          const hint = "WELCOME TO OSCP ICE BREAKER"
        
          setHint(hint)
          lastRefresh.current = Date.now();
        }
      }, 100);
    };

    let timerId = setInterval(() => {
      displayNewHint();
    }, 1000);
    displayNewHint();
    return () => clearInterval(timerId);
  }, [type, locationHint]);

  if (type === -1) return null;

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {showHintText && (
        <span
          style={{
            position: "absolute",
            top: "-24px",
            left: "0px",
            padding: "0 5px",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Hint
        </span>
      )}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          height: types[type][1],
          width: types[type][0],
          textAlign: "center",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          padding: "10px",
          fontSize: "16px",
        }}
        id={`hint_${types[type][0]}x${types[type][1]}`}
        ref={hintDivRef}
      >
        {hint}
      </div>
    </div>
  );
}
