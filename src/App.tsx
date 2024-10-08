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

  // Event Handling
  const colorsPickerMove = useCallback(
    ({ clientX, clientY }: clientCoords) => {
      if (!colorsRef.current) return;
      console.log(isPicking);

      const refName = currentPicker.current;
      let currentRef;
      let currentPickerRef;

      if (refName === "colors") {
        currentRef = colorsRef;
        currentPickerRef = colorsPickerRef;
      } else if (refName === "colorGroup") {
        currentRef = colorGroupRef;
        currentPickerRef = colorGroupPickerRef;
      }

      if (currentRef?.current && currentPickerRef?.current) {
        const colorRect = currentRef.current.getBoundingClientRect();
        let x = clientX - colorRect.left;
        let y = clientY - colorRect.top;

        // Clamping to ensure the picker stays within the bounds
        x = Math.max(0, Math.min(x, colorRect.width));
        y = Math.max(0, Math.min(y, colorRect.height));

        if (refName !== "colorGroup")
          currentPickerRef.current.style.left = `${x}px`;
        currentPickerRef.current.style.top = `${y}px`;
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

  const colorsMouseUp = () => {
    setIsPicking(false);
  };

  // Color Pick Handling
  useEffect(() => {
    if (isPicking) {
      window.addEventListener("mousemove", colorsPickerMove);
    } else {
      window.removeEventListener("mousemove", colorsPickerMove);
    }

    // Cleanup on component unmount or when isPicking changes
    return () => {
      window.removeEventListener("mousemove", colorsPickerMove);
    };
  }, [isPicking, colorsPickerMove]);

  return (
    <div className="ColorPicker">
      <div
        className="colors"
        onMouseDown={e => colorsMouseDown(e, "colors")}
        onMouseUp={colorsMouseUp}
        ref={colorsRef}
      >
        <div className="picker" ref={colorsPickerRef}></div>
      </div>

      <div
        className="colorGroup"
        onMouseDown={e => colorsMouseDown(e, "colorGroup")}
        onMouseUp={colorsMouseUp}
        ref={colorGroupRef}
      >
        <div className="picker" ref={colorGroupPickerRef}></div>
      </div>

      <div className="alphaChannel">
        <div className="picker"></div>
      </div>

      <div className="pickedColor">
        <div className="picker"></div>
      </div>
    </div>
  );
}

export default App;
