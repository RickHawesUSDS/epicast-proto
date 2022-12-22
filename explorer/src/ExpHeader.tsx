import { Header, Menu, NavDropDownButton, NavMenuButton, PrimaryNav, Title } from '@trussworks/react-uswds'
import React, { useState } from 'react'

const onToggle = (
  index: number,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean[]>>
): void => {
  setIsOpen((prevIsOpen) => {
    const newIsOpen = [false, false]
    newIsOpen[index] = !prevIsOpen[index]
    return newIsOpen
  })
}

export default function ExpHeader (): JSX.Element {
  const sectionItems = [
    <a href='#linkOne' key='one'>
      Section 1
    </a>,
    <a href='#linkTwo' key='two'>
      Section 2
    </a>
  ]

  const [isOpen, setIsOpen] = useState([false, false])

  const navMenu = [
    <div key={0}>
      <NavDropDownButton
        menuId='testDropDownOne'
        onToggle={(): void => {
          onToggle(0, setIsOpen)
        }}
        isOpen={isOpen[0]}
        label='Sections'
        isCurrent
      />
      <Menu
        key='one'
        items={sectionItems}
        isOpen={isOpen[0]}
        id='testDropDownOne'
      />
    </div>,
    <a href='#three' key='three' className='usa-nav__link'>
      <span>About</span>
    </a>
  ]
  const [expanded, setExpanded] = useState(false)
  const onClick = (): void => setExpanded((prvExpanded) => !prvExpanded)

  return (
    <Header basic>
      <div className='usa-nav-container'>
        <div className='usa-navbar'>
          <Title>EpiCast Feed Explorer</Title>
          <NavMenuButton onClick={onClick} label='Menu' />
        </div>
        <PrimaryNav
          items={navMenu}
          mobileExpanded={expanded}
          onToggleMobileNav={onClick}
        />
      </div>
    </Header>
  )
}
