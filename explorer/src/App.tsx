import React, { useState } from 'react';
import './App.css'
import { Header, Menu, NavDropDownButton, NavMenuButton, PrimaryNav, Title } from '@trussworks/react-uswds'


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


function App() {
  const [expanded, setExpanded] = useState(false)
  const onClick = (): void => setExpanded((prvExpanded) => !prvExpanded)

  const sectionItems = [
    <a href="#linkOne" key="one">
      Section 1
    </a>,
    <a href="#linkTwo" key="two">
      Section 2
    </a>,
  ]

  const [isOpen, setIsOpen] = useState([false, false])

  const navMenu = [
    <>
      <NavDropDownButton
        menuId="testDropDownOne"
        onToggle={(): void => {
          onToggle(0, setIsOpen)
        }}
        isOpen={isOpen[0]}
        label="Sections"
        isCurrent={true}
      />
      <Menu
        key="one"
        items={sectionItems}
        isOpen={isOpen[0]}
        id="testDropDownOne"
      />
    </>,
    <a href="#three" key="three" className="usa-nav__link">
      <span>About</span>
    </a>,
  ]

  return (
    <div className="App">
      <Header basic={true}>
        <div className="usa-nav-container">
          <div className="usa-navbar">
            <Title>EpiCast Feed</Title>
            <NavMenuButton onClick={onClick} label="Menu" />
          </div>
          <PrimaryNav
            items={navMenu}
            mobileExpanded={expanded}
            onToggleMobileNav={onClick}>
          </PrimaryNav>
        </div>
      </Header>
    </div>
  );
}

export default App;
