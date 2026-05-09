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
