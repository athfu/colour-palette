interface ColoursProps {
  colours: string[];
}

const Palette: React.FC<ColoursProps> = ({ colours }) => {
  return (
    <svg viewBox="0 0 350 50">
      <rect
        id="square1"
        x="0"
        y="0"
        width="50"
        height="50"
        fill={colours[0]}
      ></rect>
      <rect
        id="square2"
        x="60"
        y="0"
        width="50"
        height="50"
        fill={colours[1]}
      ></rect>
      <rect
        id="square3"
        x="120"
        y="0"
        width="50"
        height="50"
        fill={colours[2]}
      ></rect>
      <rect
        id="square4"
        x="180"
        y="0"
        width="50"
        height="50"
        fill={colours[3]}
      ></rect>
      <rect
        id="square5"
        x="240"
        y="0"
        width="50"
        height="50"
        fill={colours[4]}
      ></rect>
      <rect
        id="square6"
        x="300"
        y="0"
        width="50"
        height="50"
        fill={colours[5]}
      ></rect>
    </svg>
  );
};

export default Palette;
