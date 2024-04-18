import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import OpenModalButton from '../OpenModalButton';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  const sessionLinks = sessionUser ?
    (
      <li>
        <ProfileButton user={sessionUser} />
      </li>
    ) : (
      <>
        <li>
          <OpenModalButton
            buttonText="Log In"
            modalComponent={<LoginFormModal />}
          />
          {/* <NavLink to="/login">Log In</NavLink> */}
        </li>
        <li>
          <OpenModalButton
            buttonText="Sign Up"
            modalComponent={<SignupFormModal />}
          />
          {/* <NavLink to="/signup">Sign Up</NavLink> */}
        </li>
      </>
    );

  return (
    <nav>
      <div>
        <NavLink to="/">Home or So</NavLink>
      </div>
      <div>
        <NavLink to="/current">all by curr user</NavLink>
      </div>
      <div>
        <NavLink to="/">Home or So</NavLink>
      </div>
      <div>
        <NavLink to="/">Home or So</NavLink>
      </div>
      {isLoaded && sessionLinks}
    </nav>
  );
}

export default Navigation;
