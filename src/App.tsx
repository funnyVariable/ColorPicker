import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";

type currentPickerType = "colors" | "colorGroup" | "alphaChannel" | "";
type clientCoords = { clientX: number; clientY: number };

function App() {
  const [isPicking, setIsPicking] = useState(false);
  const currentPicker = useRef<currentPickerType>("");

  const colorsRef = useRef<HTMLDivElement | null>(null);
  const colorsPickerRef = useRef<HTMLDivElement | null>(null);

  const colorsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorsCtx = useRef<CanvasRenderingContext2D | null>(null);
  const colorGroupCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorGroupCtx = useRef<CanvasRenderingContext2D | null>(null);

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
        x = Math.max(0, Math.min(x, colorRect.width));
        y = Math.max(0, Math.min(y, colorRect.height));

        if (refName !== "colorGroup") {
          currentPickerRef.current.style.left = `${x}px`;
        }
        if (refName !== "alphaChannel")
          currentPickerRef.current.style.top = `${y}px`;

        let pixel = colorsCtx.current!.getImageData(x, y, 1, 1)["data"];
        let rgb = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
        console.log(rgb);
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

  // Canvases
  useEffect(() => {
    // Colors Gradient
    let color = "rgba(0,0,255,1)"; // make dynamic

    if (colorsCanvasRef.current && colorGroupCanvasRef.current) {
      colorsCtx.current = colorsCanvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
      colorGroupCtx.current = colorGroupCanvasRef.current.getContext("2d", {
        willReadFrequently: true,
      });
    }

    if (colorsCtx.current && colorsCanvasRef.current) {
      colorsCanvasRef.current.width = 256;
      colorsCanvasRef.current.height = 256;
      console.log(colorsCtx.current.canvas.width);

      let gradientH = colorsCtx.current.createLinearGradient(
        0,
        0,
        colorsCtx.current.canvas.width,
        0
      );
      gradientH.addColorStop(0, "#fff");
      gradientH.addColorStop(1, color);
      colorsCtx.current.fillStyle = gradientH;
      colorsCtx.current.fillRect(
        0,
        0,
        colorsCtx.current.canvas.width,
        colorsCtx.current.canvas.height
      );

      let gradientV = colorsCtx.current.createLinearGradient(
        0,
        0,
        0,
        colorsCtx.current.canvas.height
      );
      gradientV.addColorStop(0, "rgba(0,0,0,0)");
      gradientV.addColorStop(1, "#000");
      colorsCtx.current.fillStyle = gradientV;
      colorsCtx.current.fillRect(
        0,
        0,
        colorsCtx.current.canvas.width,
        colorsCtx.current.canvas.height
      );

      // ColorGroup Gradient
      if (colorGroupCtx.current && colorGroupCanvasRef.current) {
        colorGroupCanvasRef.current.width = 40;
        colorGroupCanvasRef.current.height = 256;
        let gradient = colorGroupCtx.current.createLinearGradient(
          0,
          0,
          0,
          colorGroupCanvasRef.current.height
        );
        gradient.addColorStop(0, "rgb(255, 0, 0)");
        gradient.addColorStop(0.17, "rgb(255, 255, 0)");
        gradient.addColorStop(0.33, "rgb(0, 255, 0)");
        gradient.addColorStop(0.5, "rgb(0, 255, 255)");
        gradient.addColorStop(0.66, "rgb(0, 0, 255)");
        gradient.addColorStop(0.83, "rgb(255, 0, 255)");
        gradient.addColorStop(1, "rgb(255, 0, 0)");
        colorGroupCtx.current.fillStyle = gradient;
        colorGroupCtx.current.fillRect(
          0,
          0,
          colorGroupCanvasRef.current.width,
          colorGroupCanvasRef.current.height
        );
      }
    }
  }, []);

  return (
    <div className="ColorPicker">
      <div
        className="colors"
        onMouseDown={e => colorsMouseDown(e, "colors")}
        ref={colorsRef}
      >
        <canvas className="colorCanvas" ref={colorsCanvasRef}></canvas>
        <div className="picker" draggable="false" ref={colorsPickerRef} />
      </div>

      <div
        className="colorGroup"
        onMouseDown={e => colorsMouseDown(e, "colorGroup")}
        ref={colorGroupRef}
      >
        <canvas ref={colorGroupCanvasRef}></canvas>
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
