"use client"

import { useState } from "react"
import styled from "styled-components"

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  z-index: 1000;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 40px;
`

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
`

const NavButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    color: #0066cc;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #0066cc;
    transform: scaleX(0);
    transition: transform 0.2s ease;
  }

  &:hover::after {
    transform: scaleX(1);
  }

  ${props => props.$active && `
    color: #0066cc;
    &::after {
      transform: scaleX(1);
    }
  `}
`

const SearchButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border-radius: 4px;

  &:hover {
    color: #0066cc;
    background: rgba(0, 102, 204, 0.1);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const Logo = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
`

export default function Navbar({ activeTab, onTabChange, onToggleSidebar, onToggleMovement, sidebarOpen, movementControlsOpen }) {
  return (
    <NavbarContainer>
      <NavLeft>
        <Logo>Meteor Madness</Logo>
        <NavButton 
          $active={activeTab === 'asteroid-watch' && sidebarOpen}
          onClick={() => {
            onTabChange('asteroid-watch')
            onToggleSidebar()
          }}
        >
          Asteroid Watch
        </NavButton>
      </NavLeft>
      
      <NavRight>
        <NavButton 
          $active={activeTab === 'move' && movementControlsOpen}
          onClick={() => onToggleMovement()}
        >
          Move
        </NavButton>
      </NavRight>
    </NavbarContainer>
  )
}
