import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import Navigation from './components/Navigation/Navigation-bonus';
import * as sessionActions from './store/session';
import { Modal } from './context/Modal';
import { TbDog } from "react-icons/tb";
import TestGroups from './components/Navigation/TestGroups'


function Layout() {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <button onClick={() => navigation('/')}>Meet Dogs <TbDog /></button>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element:
      <>
        <Layout />
        <TestGroups />
        {/* <Outlet />     // doubles all elements in the */}
      </>,
    children: [
      {
        path: '/',
        element: <h1>Get All Groups.  Home Page.</h1>
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
