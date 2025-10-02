"use client"



export default function Navbar({ activeTab, onTabChange, onToggleSidebar, onToggleMovement, sidebarOpen, movementControlsOpen }) {
  return (
    <>
      <style>
        {`
          nav.transparent-navbar,
          nav[class*="transparent"],
          nav {
            background: transparent !important;
            background-color: transparent !important;
            backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Override any possible conflicting styles */
          * {
            box-sizing: border-box;
          }
          
          nav {
            all: unset;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 60px !important;
            background: transparent !important;
            background-color: transparent !important;
            backdrop-filter: none !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 0 30px !important;
            z-index: 1000 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
          }
        `}
      </style>
      <nav 
        className="transparent-navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'transparent',
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 30px',
          zIndex: 1000,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', fontWeight: 400, letterSpacing: '0.3px' }}>
          Meteor Madness
        </div>
        <button 
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'asteroid-watch' && sidebarOpen ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            fontWeight: 400,
            cursor: 'pointer',
            padding: '8px 0',
            transition: 'all 0.2s ease',
            textTransform: 'none',
            letterSpacing: '0.3px'
          }}
          onClick={() => {
            onTabChange('asteroid-watch')
            onToggleSidebar()
          }}
        >
          Asteroid Watch
        </button>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <button 
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'move' && movementControlsOpen ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            fontWeight: 400,
            cursor: 'pointer',
            padding: '8px 0',
            transition: 'all 0.2s ease',
            textTransform: 'none',
            letterSpacing: '0.3px'
          }}
          onClick={() => onToggleMovement()}
        >
          Move
        </button>
        <button style={{
          background: 'transparent',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.7)',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>
    </nav>
    </>
  )
}
