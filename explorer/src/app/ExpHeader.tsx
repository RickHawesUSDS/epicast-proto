import { Header, NavMenuButton, PrimaryNav, Title } from '@trussworks/react-uswds'
import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function ExpHeader (): JSX.Element {
  const navMenu = [
    <Link to='/about' className='usa-nav__link'>
      <span>About</span>
    </Link>,
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
