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
      <nav>
        <div>
          <div>
            <NavLink to="/">Meet Dogs . <TbDog /></NavLink>
          </div>
        </div>
        {isLoaded && (
          <div className='all-groups'>
            <NavLink to="/groups">View Groups</NavLink>
            <NavLink to="/events">View Events</NavLink>
            <button
              hidden={!sessionUser}
              className='nav-btn'
              onClick={() => navigate('/createGroup')}
                >Start a New Group</button>
            <ProfileButton user={sessionUser} />
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navigation;
