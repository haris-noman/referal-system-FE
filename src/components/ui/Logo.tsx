import { cn } from "../../lib/utils";

type LogoProps = {
  className?: string;
  title?: string;
};

export const NetworkPortalLogo = ({ className, title }: LogoProps) => (
  <svg
    viewBox="0 0 40 36"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    className={cn("text-ink", className)}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26 36V30H18V10H14V16H0V0H14V6H26V0H40V16H26V10H22V26H26V20H40V36H26ZM30 12H36V4H30V12ZM30 32H36V24H30V32ZM4 12H10V4H4V12Z"
    />
  </svg>
);

export const NetworkPortalBadge = ({ className, title }: LogoProps) => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    className={className}
  >
    <rect width="32" height="32" rx="6" fill="#0B1220" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.25 22.75V20.5H15.25V13H13.75V15.25H8.5V9.25H13.75V11.5H18.25V9.25H23.5V15.25H18.25V13H16.75V19H18.25V16.75H23.5V22.75H18.25ZM19.75 13.75H22V10.75H19.75V13.75ZM19.75 21.25H22V18.25H19.75V21.25ZM10 13.75H12.25V10.75H10V13.75Z"
      fill="white"
    />
  </svg>
);
