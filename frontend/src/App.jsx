// import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import Navigation from './components/Navigation/Navigation-bonus';
import * as sessionActions from './store/session';
import { Modal } from './context/Modal';
import TestGroups from './components/Groups/TestGroups'
import * as groupActions from './store/group';
import * as eventActions from './store/events';
import LandingPage from './components/LandingPage/LandingPage';
import IndividualGroup from './components/IndividualGroup/IndividualGroup';
import IndividualEvent from './components/IndividualEvent/IndividualEvent';

function Layout() {
  // const navigation = useNavigate();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [groupsLoaded, setGroupsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser())
    .then(() => {
      setIsLoaded(true)
    });
    dispatch(groupActions.getGroups())
    .then(() => {
      setGroupsLoaded(true)
    });
    dispatch(eventActions.getEvents())
  }, [dispatch]);

  return (
    <>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && groupsLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element:
      <>
        <Layout />
        {/* <TestGroups /> */}
        {/* <Outlet />     // doubles all elements in the */}
      </>,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/groups',
        element: <TestGroups />
      },
      {
        path: '/groups/:groupId',
        element: <IndividualGroup />
      },
      {
        path: '/events/:eventId',
        element: <IndividualEvent />
      },
      // {
      //   path: 'login',
      //   element: <LoginFormPage />
      // },
      // {
      //   path: 'signup',
      //   element: <SignupFormPage />
      // }
      {
        path: '/current',
        element:
        <>
          <h1>Get all Groups joined or organized by the Current User</h1>
          {/* <Outlet /> */}
        </>,
        // children: [
        //   {
        //     path: '/:groupId/events',
        //     element: <h1>Get all Events of a Group specified by its id</h1>
        //   }
        // ]
      },
      {
        path: '*',
        element: <h1>Page Not Found</h1>
      }
    ]
  }
]);

function App() {
  return (
  <>
    <RouterProvider router={router} />
  </>
  )
}

export default App;
