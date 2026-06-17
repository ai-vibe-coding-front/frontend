interface MapPinIconProps {
  className?: string;
  fill?: string;
}

export default function MapPinIcon({ className, fill = "#2D2926" }: MapPinIconProps) {
  return (
    <svg
      viewBox="0 0 24 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C5.373 0 0 5.373 0 12C0 19.2 12 30 12 30C12 30 24 19.2 24 12C24 5.373 18.627 0 12 0ZM12 16C9.791 16 8 14.209 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16Z"
        fill={fill}
      />
    </svg>
  );
}
