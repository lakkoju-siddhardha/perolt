import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: IconGrid, end: true },
  { to: '/documents', label: 'Documents', icon: IconStack },
  { to: '/ask', label: 'Ask Perolt', icon: IconSpark },
  { to: '/settings', label: 'Settings', icon: IconGear }
];

export default function Sidebar({ mobileOpen, onNavigate }) {
  return (
    <aside className={'sidebar' + (mobileOpen ? ' sidebar--open' : '')}>
      <div className="sidebar__brand">
        <span className="sidebar__mark" aria-hidden="true">
          <IconMark />
        </span>
        <span className="sidebar__wordmark">PEROLT</span>
      </div>

      <nav className="sidebar__nav" aria-label="Primary">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__avatar">S</span>
          <div className="sidebar__userinfo">
            <span className="sidebar__username">Siddhu</span>
            <span className="sidebar__userrole">Workspace owner</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* Inline icon set — kept minimal and stroke-based to match the rest
   of the UI instead of pulling in an icon library. */

function IconMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 3.5h10.5L19 7v13.5H5V3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M15.2 3.5V7H19" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 12h8M8 15.3h8M8 8.7h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconStack() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4.5 6.2 12 3l7.5 3.2L12 9.4 4.5 6.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4.5 12 12 15.2 19.5 12M4.5 17.8 12 21l7.5-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5c.6 3.3 1.7 5 5.5 5.5-3.8.5-4.9 2.2-5.5 5.5-.6-3.3-1.7-5-5.5-5.5 3.8-.5 4.9-2.2 5.5-5.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M18 16.2c.3 1.6.9 2.3 2.5 2.6-1.6.3-2.2 1-2.5 2.6-.3-1.6-.9-2.3-2.5-2.6 1.6-.3 2.2-1 2.5-2.6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3.1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.8v2M12 18.2v2M20.2 12h-2M5.8 12h-2M17.5 6.5l-1.4 1.4M7.9 16.1l-1.4 1.4M17.5 17.5l-1.4-1.4M7.9 7.9 6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
