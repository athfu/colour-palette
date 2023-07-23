import React from "react";
import { useMemo, useState, useEffect } from "react";
import p5 from "p5";

interface ColoursProps {
  colours: string[];
}

const VARIANCE = 1.05;

const BASE_DEFORMATIONS = 3;
const LAYER_DEFORMATIONS = 3;
const NUM_LAYERS = 4;
const STROKE_OPACITY = 4;
const LAYER_OPACITY = 1.5;

// NOTE: assigning p5 to window because someone can need it globally to use in others libraries
// if (typeof window !== "undefined") {
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-ignore
//   window.p5 = p5;
// }

export const p5Events = [
  "draw",
  "windowResized",
  "preload",
  "mouseClicked",
  "doubleClicked",
  "mouseMoved",
  "mousePressed",
  "mouseWheel",
  "mouseDragged",
  "mouseReleased",
  "keyPressed",
  "keyReleased",
  "keyTyped",
  "touchStarted",
  "touchMoved",
  "touchEnded",
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
];

interface SketchProps {
  setup: any;
  draw: any;
}

class Sketch extends React.Component<
  SketchProps & React.HTMLAttributes<HTMLDivElement>
> {
  canvasParentRef: React.RefObject<any>;
  sketch: p5 | null = null;

  constructor(props: SketchProps) {
    super(props);
    this.canvasParentRef = React.createRef();
  }

  componentDidMount() {
    this.sketch = new p5((p) => {
      p.setup = () => {
        this.props.setup(p, this.canvasParentRef.current);
      };

      p5Events.forEach((event) => {
        // @ts-expect-error: add proper type here
        if (this.props[event]) {
          p[event] = (...rest: any) => {
            // @ts-expect-error: add proper type here
            this.props[event](p, ...rest);
          };
        }
      });
    });
  }
  componentWillUnmount() {
    this.sketch?.remove();
  }
  render() {
    return (
      <div
        ref={this.canvasParentRef}
        className={this.props.className || "react-p5"}
        data-testid="react-p5"
        style={this.props.style || {}}
      />
    );
  }
}

const paletteToWatercolour = (paletteColours: string[]) => {
  return paletteColours.map((stringColour) => {
    stringColour = stringColour.replace("hsl", "");
    stringColour = stringColour.replace("(", "");
    stringColour = stringColour.replace("%", "");
    stringColour = stringColour.replace(")", "");
    const colour = stringColour.split(",").map(parseFloat);
    return colour;
  });
};

const drawSplotch = (
  p5i: p5.p5InstanceExtensions,
  x: number,
  y: number,
  colour: number[]
) => {
  const radius = 100;
  const polygon = generatePolygon(p5i, 3, radius, x, y);

  let basePolygon = polygon;
  basePolygon = deformPolygon(p5i, basePolygon, BASE_DEFORMATIONS);

  // const rgb = [
  //   Math.random() * 150 + 110,
  //   Math.random() * 150 + 110,
  //   Math.random() * 150 + 110,
  // ];
  const hsl = colour;

  // const hsl = [p5.random(0, 360), p5.random(30, 50), p5.random(80, 90)];
  // const stroke_opacity = Math.random() * LAYER_OPACITY * 4 + 1;

  const strokeOpacity = p5i.random() * STROKE_OPACITY;
  const fillOpacity = p5i.random() * LAYER_OPACITY;

  for (let i = 0; i < NUM_LAYERS; i++) {
    let layerPolygon = basePolygon.map((v) => copyVectorWithVariance(p5i, v));
    layerPolygon = deformPolygon(p5i, layerPolygon, LAYER_DEFORMATIONS);

    // p5.fill(rgb[0], rgb[1], rgb[2], LAYER_OPACITY);
    // p5.fill(rgb[0], rgb[1], rgb[2], fillOpacity);
    p5i.fill(hsl[0], hsl[1], hsl[2], fillOpacity);

    p5i.strokeWeight(1);
    // p5.stroke(rgb[0], rgb[1], rgb[2], strokeOpacity);
    p5i.stroke(hsl[0], hsl[1], hsl[2], strokeOpacity);

    drawPolygon(p5i, layerPolygon);
  }
};

const drawPolygon = (p5: p5.p5InstanceExtensions, deformedPolygon: any) => {
  p5.beginShape();
  for (const point of deformedPolygon) {
    p5.vertex(point.x, point.y);
  }
  p5.endShape(p5.CLOSE);
};

interface VecWithVariance extends p5.Vector {
  variance: number;
}

const copyVectorWithVariance = (
  p5: p5.p5InstanceExtensions,
  vector: VecWithVariance
) => {
  const newVector = vector.copy() as VecWithVariance;
  newVector.variance = vector.variance;
  return newVector;
};

const generatePolygon = (
  p5: p5.p5InstanceExtensions,
  n: number,
  radius: number,
  centerX: number,
  centerY: number
) => {
  const polygon = [];
  const angle = p5.TWO_PI / n;

  for (let i = 0; i < n; i++) {
    const x = centerX + p5.cos(i * angle) * radius;
    const y = centerY + p5.sin(i * angle) * radius;
    const vertex = p5.createVector(x, y) as VecWithVariance;
    vertex.variance = p5.random(0.5, 2);
    polygon.push(vertex);
  }

  return polygon;
};
function deformPolygon(
  p5i: p5.p5InstanceExtensions,
  polygon: any,
  recursionDepth: number
) {
  if (recursionDepth === 0) {
    return polygon;
  }
  const deformedPolygon = [];

  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const c = polygon[(i + 1) % polygon.length];
    const b = p5.Vector.add(a, c).mult(0.5);

    const d = p5.Vector.sub(b, a);
    const segmentVariance = (a.variance + c.variance) * 0.5 * VARIANCE;
    const perpendicularVector = p5i.createVector(d.y, -d.x);
    perpendicularVector.mult(segmentVariance);
    const randomAngle = p5i.random(-p5i.PI / 2, p5i.PI / 2);
    perpendicularVector.rotate(randomAngle);

    const bPrime = p5.Vector.add(b, perpendicularVector) as VecWithVariance;
    bPrime.variance = segmentVariance * 0.9 * p5i.random(0.9, 1.1);
    a.variance *= 0.9 * p5i.random(0.9, 1.1);

    deformedPolygon.push(a);
    deformedPolygon.push(bPrime);
  }

  return deformPolygon(p5i, deformedPolygon, recursionDepth - 1);
}

const useP5DupeRemover = () => {
  const [parent, setParent] = useState<Element>(); // If you're using JS, remove the <Element>

  useEffect(() => {
    if (!parent) return;
    const allButFirst = Array.from(parent.children).slice(1);
    allButFirst.forEach((child) => {
      parent.removeChild(child);
    });
  }, [parent]);

  return setParent;
};

const WatercolourComponent: React.FC<ColoursProps> = ({ colours }) => {
  const palette = paletteToWatercolour(colours);
  const setParent = useP5DupeRemover();

  const setup = (p5: p5.p5InstanceExtensions, canvasParentRef: Element) => {
    setParent(canvasParentRef);
    // p5.randomSeed(25);
    p5.random();
    p5.createCanvas(350, 350).parent(canvasParentRef);
    // p5.colorMode(p5.RGB, 360, 100, 100, 100);
    p5.colorMode(p5.HSL, 360, 100, 100, 100);
    p5.noLoop();
  };

  const draw = useMemo(
    () => (p5: p5.p5InstanceExtensions) => {
      p5.background(1100);
      const n = 24;
      for (let i = 0; i < n; i += 1) {
        const colour = palette[i % palette.length];
        drawSplotch(
          p5,
          p5.random() * p5.width,
          p5.random() * p5.height,
          colour
        );
      }
    },
    [palette]
  );

  return <Sketch key={palette.toString()} setup={setup} draw={draw} />;
};

export default WatercolourComponent;
