interface ColoursProps {
  colours: string[];
}

const PaletteComponent: React.FC<ColoursProps> = ({ colours }) => {
  const squareSize = 40;
  const padding = 10;

  return (
    <svg viewBox="0 0 290 50">
      <rect
        id="square1"
        x="0"
        y="0"
        width={squareSize}
        height={squareSize}
        fill={colours[0]}
      ></rect>
      <rect
        id="square2"
        x="50"
        y="0"
        width={squareSize}
        height={squareSize}
        fill={colours[1]}
      ></rect>
      <rect
        id="square3"
        x="100"
        y="0"
        width={squareSize}
        height={squareSize}
        fill={colours[2]}
      ></rect>
      <rect
        id="square4"
        x="150"
        y="0"
        width={squareSize}
        height={squareSize}
        fill={colours[3]}
      ></rect>
      <rect
        id="square5"
        x="200"
        y="0"
        width={squareSize}
        height={squareSize}
        fill={colours[4]}
      ></rect>
      <rect
        id="square6"
        x="250"
        y="0"
        width={squareSize}
        height={squareSize}
        fill={colours[5]}
      ></rect>
    </svg>
  );
};

export default PaletteComponent;
