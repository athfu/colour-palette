import { useState, useRef, useEffect } from "react";
import "./App.css";
import PaletteComponent from "./palette.tsx";
import WatercolourComponent from "./watercolour.tsx";

const API_BASE_URL = "http://localhost:5001";

// const InitColours: string[] = [
//   "#9300ff",
//   "#b042ff",
//   "#ca8dfd",
//   "#e1affd",
//   "#f0ceff",
//   "#ededed",
// ];

const InitColours: string[] = [
  "hsl(275,100%,50%)",
  "hsl(275,100%,63%)",
  "hsl(273,97%,77%)",
  "hsl(278,95%,84%)",
  "hsl(282,100%,90%)",
  "hsl(0,0%,93%)",
];

function App() {
  const [prompt, setPrompt] = useState("");
  const [apiResponse, setAPIResponse] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [colours, setColours] = useState(InitColours);
  const [loading, setLoading] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      submitPrompt();
      console.log("prompt submitted");
    }
  };

  const submitPrompt = async () => {
    if (prompt.trim() !== "") {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/palette`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });
        const data = await response.json();
        // setAPIResponse(data.content);
        console.log(data.content);
        const newColours = JSON.parse(data.content).colors;
        console.log(newColours);
        setColours(newColours);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching response:", error);
      }
    }
  };

  const hexPalette = (paletteColours: string[]) => {
    return paletteColours.map((stringColour) => {
      stringColour = stringColour.replace("hsl", "");
      stringColour = stringColour.replace("(", "");
      stringColour = stringColour.replace("%", "");
      stringColour = stringColour.replace(")", "");
      const colour = stringColour.split(",").map(parseFloat);
      const hex = HSLToHex(colour);
      return hex;
    });
  };

  function HSLToHex(hsl: number[]): string {
    const [h, s, l] = hsl;

    const hDecimal = l / 100;
    const a = (s * Math.min(hDecimal, 1 - hDecimal)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = hDecimal - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);

      // Convert to Hex and prefix with "0" if required
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  const handleCopyPalette = async () => {
    await navigator.clipboard.writeText(JSON.stringify(hexPalette(colours)));
    alert("colour palette copied to clipboard");
  };

  const LoadingSpinner = () => {
    return (
      <div className="spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  return (
    <>
      <h1>colour palette</h1>
      <br />
      <div className="input-container">
        <div style={{ display: "flex" }}>
          <input
            className="prompt-input"
            type="text"
            ref={inputRef}
            name="prompt"
            value={prompt}
            placeholder="purple sunset"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
          ></input>
          {loading ? <LoadingSpinner /> : null}
        </div>
      </div>
      <br />
      <div className="apiResponse">{apiResponse}</div>
      <br />
      <div id="palette">{<PaletteComponent colours={colours} />}</div>
      <br />
      <div id="sketch">{<WatercolourComponent colours={colours} />}</div>
      <br />
      <button onClick={handleCopyPalette}>copy palette</button>
    </>
  );
}

export default App;
