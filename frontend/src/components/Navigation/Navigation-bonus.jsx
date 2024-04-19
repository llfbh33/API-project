import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import './Navigation.css';
import ProfileButton from './ProfileButton-bonus';

import { TbDog } from "react-icons/tb";

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <div className='header'>
      <nav>
        <div>
          <div>
            <NavLink to="/">Meet Dogs <TbDog /></NavLink>
          </div>
          <div>
            {/* <NavLink to="/groups">All Groups</NavLink> */}
          </div>
          <div>
            {/* <NavLink to="/groups">All Groups</NavLink> */}
          </div>
          <div>
            {/* <NavLink to="/groups">All Groups</NavLink> */}
          </div>
          <div>
            {/* <NavLink to="/groups">All Groups</NavLink> */}
          </div>
        </div>
        {isLoaded && (
          <div className='all-groups'>
            <NavLink to="/groups">View Groups</NavLink>
            <ProfileButton user={sessionUser} />
          </div>
        )}
      </nav>
    </div>
  );
}

export default Navigation;
