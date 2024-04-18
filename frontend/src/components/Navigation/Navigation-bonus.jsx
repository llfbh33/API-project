import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <nav>
      <dev>
        <NavLink to="/">Home</NavLink>
      </dev>
      <dev>
        <NavLink to="/groups">All Groups</NavLink>
      </dev>
      <dev>
        <NavLink to="/groups">All Groups</NavLink>
      </dev>
      <dev>
        <NavLink to="/groups">All Groups</NavLink>
      </dev>
      <dev>
        <NavLink to="/groups">All Groups</NavLink>
      </dev>
      {isLoaded && (
        <dev>
          <ProfileButton user={sessionUser} />
        </dev>
      )}
    </nav>
  );
}

export default Navigation;
