export default function OfflinePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .offline-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 1rem;
          box-sizing: border-box;
        }
        @media (prefers-color-scheme: dark) {
          .offline-container {
            background: radial-gradient(circle, #0f172a 0%, #020617 100%);
          }
        }
        .offline-card {
          position: relative;
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 1.5rem;
          padding: 2.5rem 2rem;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          box-sizing: border-box;
        }
        @media (prefers-color-scheme: dark) {
          .offline-card {
            background: #0f172a;
            border-color: rgba(51, 65, 85, 0.8);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
          }
        }
        .offline-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 6px;
          background: #000066;
        }
        .offline-pulse-outer {
          margin: 0 auto 1.5rem auto;
          width: 6rem;
          height: 6rem;
          border-radius: 50%;
          background: rgba(0, 0, 102, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: offline-pulse 2s infinite ease-in-out;
        }
        @media (prefers-color-scheme: dark) {
          .offline-pulse-outer {
            background: rgba(56, 189, 248, 0.05);
          }
        }
        .offline-pulse-inner {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background: rgba(0, 0, 102, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (prefers-color-scheme: dark) {
          .offline-pulse-inner {
            background: rgba(56, 189, 248, 0.1);
          }
        }
        .offline-icon {
          width: 2rem;
          height: 2rem;
          color: #000066;
        }
        @media (prefers-color-scheme: dark) {
          .offline-icon {
            color: #38bdf8;
          }
        }
        .offline-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }
        @media (prefers-color-scheme: dark) {
          .offline-title {
            color: #f8fafc;
          }
        }
        .offline-desc {
          font-size: 0.875rem;
          line-height: 1.625;
          color: #64748b;
          margin: 0 0 2rem 0;
        }
        @media (prefers-color-scheme: dark) {
          .offline-desc {
            color: #94a3b8;
          }
        }
        .offline-btn {
          width: 100%;
          height: 3rem;
          background: #000066;
          border: none;
          border-radius: 0.75rem;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 102, 0.15);
        }
        .offline-btn:hover {
          background: #000088;
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 102, 0.2);
        }
        .offline-btn:active {
          transform: translateY(0);
        }
        .offline-footer {
          margin-top: 1.5rem;
          font-size: 0.625rem;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        @keyframes offline-pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      ` }} />

      <main className="offline-container">
        <div className="offline-card">
          {/* Subtle top decoration bar */}
          <div className="offline-accent-bar" />

          {/* Outer pulsating circle */}
          <div className="offline-pulse-outer">
            <div className="offline-pulse-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="offline-icon" style={{ width: '2rem', height: '2rem' }}><path d="M1 1l22 22"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5"/><path d="M5 12.5a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.5 9"/><path d="M1.5 9a16 16 0 0 1 9.06-3.83"/><path d="M12 20h.01"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/></svg>
            </div>
          </div>

          <h1 className="offline-title">
            Connectivity Lost
          </h1>
          <p className="offline-desc">
            The requested page could not be loaded. Please check your internet connection and try reloading the interface.
          </p>

          <button
            id="reload-btn"
            className="offline-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '0.875rem', height: '0.875rem' }}><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            <span>Reload Connection</span>
          </button>

          <div className="offline-footer">
            IJITEST Academic Portal
          </div>
        </div>
      </main>

      <script dangerouslySetInnerHTML={{ __html: `
        document.getElementById('reload-btn').addEventListener('click', function() {
          window.location.reload();
        });
      ` }} />
    </>
  );
}