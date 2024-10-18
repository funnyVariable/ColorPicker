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

  // Event Handling
  const colorsPickerMove = useCallback(
    ({ clientX, clientY }: clientCoords) => {
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

        if (refName !== "colorGroup") {
          currentPickerRef.current.style.left = `${x}px`;
        }
        if (refName !== "alphaChannel")
          currentPickerRef.current.style.top = `${y}px`;

        // for (let i = 0; i < 256; i++) {
        //   let [x2, y2] = [0, i];
        // let pixelPrev = colorsCtx.current!.getImageData(x2, y2 - 1, 1, 1)["data"];
        // let pixel = colorsCtx.current!.getImageData(x2, y2, 1, 1)["data"];
        // let rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        // console.log(`${pixelPrev[0] - pixel[0] === 0 || pixelPrev[0] - pixel[0] === 1} pixel: ${pixel} pixelPrev${pixelPrev}`)
        // }
      }
    },
    [isPicking]
  );

  const colorsMouseDown = (
    { clientX, clientY }: clientCoords,
    refName: currentPickerType
  ) => {
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
  }, [isPicking, colorsPickerMove]);

  return (
    <div className="ColorPicker">
      <div
        className="colors"
        onMouseDown={e => colorsMouseDown(e, "colors")}
        ref={colorsRef}
      >
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

      <div className="pickedColor">
        <div className="picker"></div>
      </div>
    </div>
  );
}

export default App;
