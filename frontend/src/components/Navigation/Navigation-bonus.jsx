import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import './Navigation.css';
import ProfileButton from './ProfileButton-bonus';

import { TbDog } from "react-icons/tb";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);
  const navigate = useNavigate();


  return (
    <div className='nav-header'>
      <nav >
        <div className='nav-home-a'>
          <div >
            <NavLink to="/" className='navigation-link' >Meet Dogs . <TbDog /></NavLink>
          </div>
        </div>
        {isLoaded && (
          <div className='all-groups'>
            <div className='nav-other-a'>
              <NavLink to="/groups" className='navigation-link'>View Groups</NavLink>
            </div>
            <div className='nav-home-a'>
              <NavLink to="/events" className='navigation-link'>View Events</NavLink>
            </div>
            <div>
              <button
                hidden={!sessionUser}
                className={sessionUser ? 'nav-btn' : ''}
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
