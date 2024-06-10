import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TbDog } from "react-icons/tb";

import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';


function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);
  const navigate = useNavigate();


  return (
    <div className='nav-header'>
      <nav className='nav-container'>
        <div className='nav-home-a nav-logo'>
          <div >
            <NavLink to="/" className='navigation-link nav-link' >Meet Dogs . <TbDog /></NavLink>
          </div>
        </div>
        {isLoaded && (
          <div className='all-groups nav-links'>
            <div className='nav-other-a'>
              <NavLink to="/groups" className='navigation-link nav-link'>View Groups</NavLink>
            </div>
            <div className='nav-home-a'>
              <NavLink to="/events" className='navigation-link nav-link'>View Events</NavLink>
            </div>
            <div>
              <button
                hidden={!sessionUser}
                className={`nav-btn ${sessionUser ? 'visible' : ''}`}
                onClick={() => navigate('/createGroup')}
              >Start a New Group</button>
            </div>
              <ProfileButton user={sessionUser} />
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navigation;
