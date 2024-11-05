import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

type currentPickerType = "colors" | "colorGroup" | "alphaChannel" | "";
type clientCoords = { clientX: number; clientY: number };
type rgb = [number, number, number];
type color = [number, number, number, number, number];

function App() {
  const [isPicking, setIsPicking] = useState(false);
  const currentPicker = useRef<currentPickerType>("");

  const colorsRef = useRef<HTMLDivElement | null>(null);
  const colorsPickerRef = useRef<HTMLDivElement | null>(null);

  const colorGroupRef = useRef<HTMLDivElement | null>(null);
  const colorGroupPickerRef = useRef<HTMLDivElement | null>(null);

  const alphaChannelRef = useRef<HTMLDivElement | null>(null);
  const alphaChannelPickerRef = useRef<HTMLDivElement | null>(null);

  const [color, setColor] = useState<color>([255, 0, 0, 255, 0]);
  const colorGroup = useRef<rgb>([255, 0, 0]);

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

      function calculateColor(x: number, y: number): color {
        const [R, G, B] = colorGroup.current;

        const r = Math.round((1 - y / 255) * ((255 - R) * (1 - x / 255) + R));
        const g = Math.round((1 - y / 255) * ((255 - G) * (1 - x / 255) + G));
        const b = Math.round((1 - y / 255) * ((255 - B) * (1 - x / 255) + B));

        return [r, g, b, x, y];
      }

      // #region ------ Colors Event ------
      if (refName === "colors") {
        currentPickerRef.current.style.top = `${y}px`;
        currentPickerRef.current.style.left = `${x}px`;
        setColor(calculateColor(x, y));
      }

      // #region ------ ColorGroup Event ------
      if (refName === "colorGroup") {
        currentPickerRef.current.style.top = `${Math.min(y, 254)}px`;

        function calculateColorGroup(y: number): rgb {
          let r = 255;
          let g = 0;
          let b = 0;

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
          } else if (_17 < y && y <= _33) {
            r = Math.round(255 * (1 - (y - _17) / (_33 - _17)));
            g = 0;
            b = 255;
          } else if (_33 < y && y <= _50) {
            r = 0;
            g = Math.round(255 * ((y - _33) / (_50 - _33)));
            b = 255;
          } else if (_50 < y && y <= _66) {
            r = 0;
            g = 255;
            b = 0;
          } else if (_66 < y && y <= _83) {
            r = Math.round(255 * ((y - _66) / (_83 - _66)));
            g = 255;
            b = 0;
          } else if (_83 < y && y <= 255) {
            r = 255;
            g = Math.round(255 * (1 - (y - _83) / (255 - _83)));
            b = 0;
          }

          return [r, g, b];
        }

        colorGroup.current = calculateColorGroup(y);
        setColor(prev => calculateColor(prev[3], prev[4]));
        currentPickerRef.current.style.top = `${y}px`;
      }

      // #region ------ AlphaChannel Event ------
      if (refName === "alphaChannel") {
        currentPickerRef.current.style.left = `${Math.min(x, 254)}px`;
        currentPickerRef.current.style.left = `${x}px`;
      }
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
        <div
          className="gradient1"
          style={{
            background: `linear-gradient(to left, rgb(${colorGroup.current[0]}, ${colorGroup.current[1]}, ${colorGroup.current[2]}), transparent)`,
          }}
        />
        <div className="gradient2" />
        <div className="picker" ref={colorsPickerRef} />
      </div>

      <div
        className="colorGroup"
        onMouseDown={e => colorsMouseDown(e, "colorGroup")}
        ref={colorGroupRef}
      >
        <div className="picker" ref={colorGroupPickerRef} />
      </div>

      <div
        className="alphaChannel"
        onMouseDown={e => colorsMouseDown(e, "alphaChannel")}
        ref={alphaChannelRef}
      >
        <div className="picker" ref={alphaChannelPickerRef} />
      </div>

      <div
        className="pickedColor"
        style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` }}
      >
        <div className="picker" style={{ color: "red" }}>
          {`rgb(${color[0]}, ${color[1]}, ${color[2]})`}
        </div>
      </div>
    </div>
  );
}

export default App;
