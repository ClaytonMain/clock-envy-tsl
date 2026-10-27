import type { BasicClockConfig } from "../types/types";

export const DEFAULT_CLOCK_NAME = "Archduke Von Orben";

export const BASIC_CLOCK_CONFIGS: BasicClockConfig[] = [
  {
    name: "Archduke Von Orben",
    displayOnSite: true,
    info: (
      <div className="flex flex-col gap-4">
        <span className="italic">Do not upset Archduke Von Orben.</span>
        <span className="indent-3">
          This clock is a tribute to the late Archduke Von Orben, a brilliant
          clockmaker who dedicated his life to the art of horology. His designs
          were known for their elegance, precision, and innovation. The Archduke
          Von Orben clock is a testament to his legacy, featuring intricate
          mechanisms and a timeless aesthetic that continues to inspire clock
          enthusiasts around the world. My autocomplete just hallucinated all
          that there's nobody named Archduke Von Orben as far as I'm aware.
        </span>
      </div>
    ),
    acknowledgements: (
      <div className="flex flex-col gap-4">
        <ul className="list-inside list-disc">
          <li>
            The shader for the orb is loosely adapted from Bruno Simon's{" "}
            <a
              className="underline"
              href="https://threejs-journey.com/lessons/wobbly-sphere-shader#compute-the-normal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wobbly Sphere Shader tutorial
            </a>
            .
          </li>
        </ul>
      </div>
    ),
  },
];

export const STATS_CLASS_NAME =
  "if-it-works-then-it-aint-25783154-7c53-4f0f-bb9c-5b6813dc653e";
