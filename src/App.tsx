import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

type currentPickerType = "colors" | "colorGroup" | "alphaChannel" | "";
type clientCoords = { clientX: number; clientY: number };

function App() {
  const [isPicking, setIsPicking] = useState(false);
  const currentPicker = useRef<currentPickerType>("");

  const colorsRef = useRef<HTMLDivElement | null>(null);
  const colorsPickerRef = useRef<HTMLDivElement | null>(null);

  const colorGroupRef = useRef<HTMLDivElement | null>(null);
  const colorGroupPickerRef = useRef<HTMLDivElement | null>(null);

  const alphaChannelRef = useRef<HTMLDivElement | null>(null);
  const alphaChannelPickerRef = useRef<HTMLDivElement | null>(null);

  const color = useRef("");

  // Event Handling
  const colorsPickerMove = useCallback(({ clientX, clientY }: clientCoords) => {
    if (!colorsRef.current) return;

    const refName = currentPicker.current;
    let currentRef;
    let currentPickerRef;

    if (refName === "colors") {
      currentRef = colorsRef;
      currentPickerRef = colorsPickerRef;
    } else if (refName === "colorGroup") {
      currentRef = colorGroupRef;
      currentPickerRef = colorGroupPickerRef;
    } else if (refName === "alphaChannel") {
      currentRef = alphaChannelRef;
      currentPickerRef = alphaChannelPickerRef;
    }

    if (currentRef?.current && currentPickerRef?.current) {
      const colorRect = currentRef.current.getBoundingClientRect();
      let x = clientX - colorRect.left;
      let y = clientY - colorRect.top;

      // Clamp
      x = Math.floor(Math.max(0, Math.min(x, colorRect.width - 1)));
      y = Math.floor(Math.max(0, Math.min(y, colorRect.height - 1)));

      if (refName !== "colorGroup") {
        currentPickerRef.current.style.left = `${x}px`;
      }
      if (refName !== "alphaChannel") currentPickerRef.current.style.top = `${y}px`;

      function calculateColor(x: number, y: number) {
        const r = Math.round(((255 - x) * (255 - y)) / 255);
        const g = Math.round(((255 - x) * (255 - y)) / 255);
        const b = 255 - y;

        return `rgb(${r}, ${g}, ${b})`;
      }

      color.current = calculateColor(x, y);
      console.log(calculateColor(x, y));
    }
  }, []);

  const colorsMouseDown = ({ clientX, clientY }: clientCoords, refName: currentPickerType) => {
    currentPicker.current = refName;
    colorsPickerMove({ clientX, clientY });
    setIsPicking(true);
  };

  const colorsMouseUp = useCallback(() => {
    setIsPicking(false);
  }, []);

  // Color Pick Handling
  useEffect(() => {
    if (isPicking) {
      window.addEventListener("mousemove", colorsPickerMove);
      window.addEventListener("mouseup", colorsMouseUp);
    } else {
      window.removeEventListener("mousemove", colorsPickerMove);
      window.removeEventListener("mouseup", colorsMouseUp);
    }

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", colorsPickerMove);
      window.removeEventListener("mouseup", colorsMouseUp);
    };
  }, [isPicking, colorsPickerMove, colorsMouseUp]);

  return (
    <div className="ColorPicker">
      <div className="colors" onMouseDown={e => colorsMouseDown(e, "colors")} ref={colorsRef}>
        <div className="gradient1"></div>
        <div className="gradient2"></div>
        <div className="picker" draggable="false" ref={colorsPickerRef} />
      </div>

      <div className="colorGroup" onMouseDown={e => colorsMouseDown(e, "colorGroup")} ref={colorGroupRef}>
        <div className="picker" ref={colorGroupPickerRef} draggable="false" />
      </div>

      <div className="alphaChannel" onMouseDown={e => colorsMouseDown(e, "alphaChannel")} ref={alphaChannelRef}>
        <div className="picker" ref={alphaChannelPickerRef} draggable="false" />
      </div>

      <div className="pickedColor" style={color.current !== "" ? { backgroundColor: color.current } : {}}>
        <div className="picker" style={{ color: "red" }}>
          {color.current}
        </div>
      </div>
    </div>
  );
}

export default App;
