import { Modal } from './context/Modal';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation-bonus';

import * as sessionActions from './store/session';
import * as groupActions from './store/group';
import * as eventActions from './store/events';

import Groups from './components/Groups/Groups'
import LandingPage from './components/LandingPage/LandingPage';
import IndividualGroup from './components/IndividualGroup/IndividualGroup';
import IndividualEvent from './components/IndividualEvent/IndividualEvent';
import Events from './components/Events/Events';
import CreateGroup from './components/CreateGroup/CreateGroup';
import CreateEvent from './components/CreateEvent/CreateEvent';
import UpdateGroup from './components/UpdateGroup/UpdateGroup';


function Layout() {
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
      </>,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/groups',
        element: <Groups />
      },
      {
        path: '/groups/:groupId',
        element: <IndividualGroup />
      },
      {
        path: '/events/:eventId',
        element: <IndividualEvent />
      },
      {
        path: '/events',
        element: <Events />
      },
      {
        path: '/createGroup',
        element: <CreateGroup />
      },
      {
        path: '/groups/:groupId/events',
        element: <CreateEvent />
      },
      {
        path: '/updateGroup',
        element: <UpdateGroup />
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
