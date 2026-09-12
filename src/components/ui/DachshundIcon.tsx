import React from 'react';

interface DachshundIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  glow?: boolean;
}

/**
 * Custom SVG Icon: Long-Haired Dachshund
 * Features the signature elongated doxie profile, short legs, long snout,
 * flowing feathery wavy ears, belly fringe, and feathery arched plume tail.
 */
export const DachshundIcon: React.FC<DachshundIconProps> = ({
  size = 24,
  color = '#FF2A85', // Neon Pink default
  className = '',
  style = {},
  glow = false
}) => {
  const width = size * (44 / 26);
  const height = size;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`dachshund-icon ${className}`}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        filter: glow ? `drop-shadow(0 0 6px ${color})` : undefined,
        ...style
      }}
    >
      <g>
        {/* Main Body Silhouette with Long Feathery Hair */}
        <path
          d="
            M 6 8.5
            C 4.5 9 3 9.5 1.5 10
            C 1 10.2 1 10.8 1.5 11
            C 3.5 11.5 6 12 8 12.5
            C 8.5 14.5 10 17 11.5 18
            L 11 23.5
            C 11 24.2 11.8 24.5 12.5 24
            C 13.5 23.5 14 22.5 14.5 20
            C 17 21 20 21.5 23 21
            C 25 21.5 27 21.8 29 21.5
            L 30 23.5
            C 30.2 24.2 31 24.5 31.8 24
            C 32.5 23.5 33 22 33.5 19.5
            C 35 18.5 36.5 17 37 15
            C 39 13.5 41.5 10.5 43 7
            C 43.5 6 42.5 5.5 41.5 6.5
            C 40 8 38.5 9.5 37 11
            C 36.5 9.5 35 8.5 33 8.5
            C 28 8.5 23 9 18 9
            C 15.5 9 14 8 12.5 6
            C 11.5 4.5 10 4 8.5 4.5
            C 7 5 6.5 7 6 8.5
            Z
          "
          fill={color}
        />

        {/* Feathery Long Ear with Wavy Highlights */}
        <path
          d="
            M 9.5 5.5
            C 11.5 6 13 8 13.5 11
            C 14 13.5 13.5 16 12.5 17.5
            C 12 18.2 11 17.8 10.8 17
            C 10.2 15 10 13 9 10.5
            C 8.5 9 8.2 7 9.5 5.5
            Z
          "
          fill="#FFFFFF"
          fillOpacity="0.4"
        />

        {/* Feathered Tail Tufts (Plume effect) */}
        <path
          d="
            M 38 12
            C 40 10 42 7.5 43.5 5
            C 42 6.5 40 8 38.5 9.5
            C 37.5 10.5 37 11.5 38 12
            Z
          "
          fill="#FFFFFF"
          fillOpacity="0.6"
        />

        {/* Belly Fur Fringe Feathers */}
        <path
          d="
            M 16 20
            Q 18 22.5 20 20.5
            Q 22 23 24 20.8
            Q 26 23.2 28 21
          "
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.45"
        />

        {/* Cute Eye */}
        <circle cx="5.5" cy="8" r="0.9" fill="#FFFFFF" />

        {/* Little Nose */}
        <circle cx="1.5" cy="10.2" r="0.8" fill="#1A1A1A" />
      </g>
    </svg>
  );
};
