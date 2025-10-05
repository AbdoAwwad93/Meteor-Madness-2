"use client"

import styled from "styled-components"

const Nav = styled.nav`
  all: unset;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  height: var(--navbar-height) !important;
  background: transparent !important;
  background-color: transparent !important;
  backdrop-filter: none !important;
  border: none !important;
  box-shadow: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 0 var(--spacing-xl) !important;
  z-index: 1000 !important;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;

  @media (max-width: 768px) {
    padding: 0 var(--spacing-lg) !important;
  }

  @media (max-width: 480px) {
    padding: 0 var(--spacing-md) !important;
  }
`

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`

const Title = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.3px;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`

const NavButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.$active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.2s ease;
  text-transform: none;
  letter-spacing: 0.3px;

  @media (max-width: 768px) {
    font-size: 13px;
  }

  .desktop-only {
    display: inline;

    @media (max-width: 768px) {
      display: none;
    }
  }

  .mobile-only {
    display: none;

    @media (max-width: 768px) {
      display: inline;
    }
  }
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: 768px) {
    gap: 15px;
  }
`

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-right: 10px;

  @media (max-width: 768px) {
    margin-right: 5px;
  }

  svg {
    width: 18px;
    height: 18px;

    @media (max-width: 768px) {
      width: 16px;
      height: 16px;
    }
  }
`

const SearchButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  svg {
    width: 18px;
    height: 18px;

    @media (max-width: 768px) {
      width: 16px;
      height: 16px;
    }
  }
`

export default function Navbar({ activeTab, onTabChange, onToggleSidebar, onToggleMovement, sidebarOpen, movementControlsOpen }) {
  const handleGameClick = () => {
    window.location.href = '/Asteriod_game/UI/asteriod_game.html'
  }

  const handleLearnClick = () => {
    window.location.href = '/learning/UI/learn_page.html'
  }

  return (
    <Nav className="transparent-navbar">
      <LeftSection>
        <Title>Meteor Madness</Title>
        <NavButton 
          $active={activeTab === 'asteroid-watch' && sidebarOpen}
          onClick={() => {
            onTabChange('asteroid-watch')
            onToggleSidebar()
          }}
        >
          <span className="desktop-only">Asteroid Watch</span>
          <span className="mobile-only">Asteroids</span>
        </NavButton>
      </LeftSection>
      
      <RightSection>
        <NavButton 
          $active={activeTab === 'learn'}
          onClick={handleLearnClick}
        >
          Learn
        </NavButton>
        <NavButton 
          $active={activeTab === 'game'}
          onClick={handleGameClick}
        >
          Game
        </NavButton>
        <NavButton 
          $active={activeTab === 'move' && movementControlsOpen}
          onClick={() => onToggleMovement()}
        >
          Move
        </NavButton>
      </RightSection>
    </Nav>
  )
}
