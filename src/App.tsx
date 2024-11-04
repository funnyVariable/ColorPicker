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
      x = Math.max(0, Math.min(x, colorRect.width - 1));
      y = Math.max(0, Math.min(y, colorRect.height - 1));

      if (refName !== "colorGroup") currentPickerRef.current.style.left = `${x}px`;
      if (refName !== "alphaChannel") currentPickerRef.current.style.top = `${y}px`;
      if (refName === "colorGroup") currentPickerRef.current.style.top = `${Math.min(y, 254)}px`;
      if (refName === "alphaChannel") currentPickerRef.current.style.left = `${Math.min(x, 254)}px`;

      function calculateColor(x: number, y: number) {
        const r = Math.round(((255 - x) * (255 - y)) / 255);
        const g = Math.round(((255 - x) * (255 - y)) / 255);
        const b = Math.round(255 - y);

        return `rgb(${r}, ${g}, ${b})`;
      }

      function calculateColorGroup(y: number) {
        let r;
        let g;
        let b;

        let block = "";

        const [_17, _33, _50, _66, _83] = [
          (17 / 100) * 255,
          (33 / 100) * 255,
          (50 / 100) * 255,
          (66 / 100) * 255,
          (83 / 100) * 255,
        ];

        if (0 <= y && y <= _17) {
          r = 255;
          g = 0;
          b = Math.round((y / _17) * 255);

          block = "FIRST_BLOCK";
        } else if (_17 < y && y <= _33) {
          r = Math.round(255 * (1 - (y - _17) / (_33 - _17)));
          g = 0;
          b = 255;
          console.log(y);

          block = "SECOND_BLOCK";
        } else if (_33 < y && y <= _50) {
          r = 0;
          g = Math.round(255 * ((y - _33) / (_50 - _33)));
          b = 255;
          console.log(y);

          block = "THIRD_BLOCK";
        } else if (_50 < y && y <= _66) {
          r = 0;
          g = 255;
          b = 0;
          console.log(y);

          block = "FOURTH_BLOCK";
        } else if (_66 < y && y <= _83) {
          r = Math.round(255 * ((y - _66) / (_83 - _66)));
          g = 255;
          b = 0;
          console.log(y);

          block = "FIFTH_BLOCK";
        } else if (_83 < y && y <= 255) {
          r = 255;
          g = Math.round(255 * (1 - (y - _83) / (255 - _83)));
          b = 0;
          console.log(y);

          block = "SIXTH_BLOCK";
        }

        return `rgb(${r}, ${g}, ${b}) ${block}`;
      }

      color.current = calculateColor(x, y);
      console.log(calculateColorGroup(y));
      // clientY potential bug
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

      <div
        className="colorGroup"
        onMouseDown={e => colorsMouseDown(e, "colorGroup")}
        ref={colorGroupRef}
      >
        <div className="picker" ref={colorGroupPickerRef} draggable="false" />
      </div>

      <div
        className="alphaChannel"
        onMouseDown={e => colorsMouseDown(e, "alphaChannel")}
        ref={alphaChannelRef}
      >
        <div className="picker" ref={alphaChannelPickerRef} draggable="false" />
      </div>

      <div
        className="pickedColor"
        style={color.current !== "" ? { backgroundColor: color.current } : {}}
      >
        <div className="picker" style={{ color: "red" }}>
          {color.current}
        </div>
      </div>
    </div>
  );
}

export default App;
