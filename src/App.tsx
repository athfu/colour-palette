import { useState, useRef, useEffect } from "react";
import "./App.css";
import Palette from "./palette.tsx";

const API_BASE_URL = "http://localhost:5001";

const InitColours: string[] = [
  "#9300ff",
  "#b042ff",
  "#ca8dfd",
  "#e1affd",
  "#f0ceff",
  "#ededed",
];
function App() {
  const [prompt, setPrompt] = useState("");
  const [apiResponse, setAPIResponse] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [colours, setColours] = useState(InitColours);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      submitPrompt();
      console.log("prompt submitted");
    }
  };

  const submitPrompt = async () => {
    if (prompt.trim() !== "") {
      try {
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
        setColours(newColours);
      } catch (error) {
        console.error("Error fetching response:", error);
      }
    }
    // setPrompt("");
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
      <div>
        <label>
          <input
            type="text"
            ref={inputRef}
            name="prompt"
            value={prompt}
            placeholder="purple sunset"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          ></input>
        </label>
      </div>
      <br />
      <div className="apiResponse">{apiResponse}</div>
      <br />
      <div id="palette">{<Palette colours={colours} />}</div>
    </>
  );
}

export default App;
