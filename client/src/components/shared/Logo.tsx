import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  fillColor?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size,
  className = 'h-6 w-6',
  fillColor = 'currentColor',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 63 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M33.817 52.382c0-15.988 12.96-28.948 28.948-28.948v17.585c0 15.987-12.96 28.948-28.948 28.948zm-4.869 0c0-15.988-12.96-28.948-28.948-28.948v17.585c0 15.987 12.96 28.948 28.948 28.948z"
        fill={fillColor}
      />
      <g clipPath="url(#agencyflow-logo-clip)">
        <path
          d="M31.487 0c0 8.764 7.049 15.881 15.786 15.992l.207.001-.207.001c-8.737.11-15.786 7.228-15.786 15.992 0-8.833-7.16-15.993-15.993-15.993 8.833 0 15.993-7.16 15.993-15.993"
          fill={fillColor}
        />
      </g>
      <defs>
        <clipPath id="agencyflow-logo-clip">
          <path fill="#fff" d="M15.494 0H47.48v31.986H15.494z" />
        </clipPath>
      </defs>
    </svg>
  );
};
