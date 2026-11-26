// Inline SVG icons. All are decorative (aria-hidden); the button that contains
// them is responsible for providing an accessible label.

type IconProps = { className?: string };

export function CameraIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 64 48" fill="currentColor" aria-hidden="true">
            {/* Two film reels, each a disc with a centre hole */}
            <path
                fillRule="evenodd"
                d="M14 1 a9.5 9.5 0 1 0 0.01 0 Z M14 7.5 a3 3 0 1 1 -0.01 0 Z
                   M35 1 a9.5 9.5 0 1 0 0.01 0 Z M35 7.5 a3 3 0 1 1 -0.01 0 Z"
            />
            {/* Body */}
            <rect x="4" y="22" width="40" height="22" rx="3" />
            {/* Lens hood */}
            <path d="M44 29 L61 21 V45 L44 37 Z" />
        </svg>
    );
}

export function MaskIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 48 56" aria-hidden="true">
            <path
                fill="currentColor"
                d="M4 4 C16 0 32 0 44 4 C46 22 42 44 24 54 C6 44 2 22 4 4 Z"
            />
            <g fill="var(--mask-cutout, #071f35)">
                <path d="M11 18 C14 14 19 14 21 18 C18 21 14 21 11 18 Z" />
                <path d="M27 18 C29 14 34 14 37 18 C34 21 30 21 27 18 Z" />
                <path d="M14 32 C20 38 28 38 34 32 C31 42 17 42 14 32 Z" />
            </g>
        </svg>
    );
}

export function MicIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 24 32" fill="currentColor" aria-hidden="true">
            <rect x="7" y="1" width="10" height="18" rx="5" />
            <path
                d="M3 14 V15 A9 9 0 0 0 21 15 V14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
            />
            <rect x="10.75" y="24" width="2.5" height="5" />
            <rect x="6" y="28.5" width="12" height="2.5" rx="1" />
        </svg>
    );
}

export function SpeakerIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 32 28" fill="currentColor" aria-hidden="true">
            <path d="M2 9 H9 L18 2 V26 L9 19 H2 Z" />
            <path
                d="M22 8 A8 8 0 0 1 22 20 M25 4 A13 13 0 0 1 25 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function ArrowUpIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M7 15 V2 M1.5 7.5 L7 2 L12.5 7.5" />
        </svg>
    );
}

export function ArrowDownIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M7 1 V14 M1.5 8.5 L7 14 L12.5 8.5" />
        </svg>
    );
}

export function MinusIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <rect x="1" y="7.5" width="18" height="5" rx="2" />
        </svg>
    );
}

export function PlusIcon({ className }: IconProps) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <rect x="1" y="7.5" width="18" height="5" rx="2" />
            <rect x="7.5" y="1" width="5" height="18" rx="2" />
        </svg>
    );
}
