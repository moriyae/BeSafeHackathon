export default function CircleLogo() {
    return (
        <div style={{
      width: 64,
      height: 64,
      margin: "0 auto 24px"
    }}>
            <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4FD1C5" />
                        <stop offset="50%" stopColor="#F6AD55" />
                        <stop offset="100%" stopColor="#FC8181" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}
export { CircleLogo };