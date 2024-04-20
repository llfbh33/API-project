import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal';

import './LandingPage.css'
import { FaBullseye } from "react-icons/fa";


const LandingPage = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state.session.user)

    const [signedIn, setSignedIn] = useState(FaBullseye);
    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();

    useEffect(() => {
        if (user) setSignedIn(true);
        else setSignedIn(false);
    }, [user, signedIn])

    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
          if (ulRef.current && !ulRef.current.contains(e.target)) {
            setShowMenu(false);
          }
        };

        document.addEventListener('click', closeMenu);

        return () => document.removeEventListener('click', closeMenu);
      }, [showMenu]);

      const closeMenu = () => setShowMenu(false);

    return (
        <div className="landing">
            <div className="one">
                <div className="intro">
                    <h1>Happy Dogs are Social Dogs</h1>
                    <h3>Get out and about with your best friend, find new friends to share the adventure with. Make your fur baby as happy as they make you.
                    </h3>
                </div>
                <div>
                    <img src='https://cdn.pixabay.com/photo/2024/01/20/17/33/dog-8521550_1280.png' alt='goofy group of dogs' />
                </div>

            </div>
            <div className='two'>
                <h3>How Meet Dogs Works</h3>
                <p>Set up playdates, join dog communities, go for hikes, whatever</p>
            </div>
            <div className="three">
                <div className="links">
                    <img src='https://images.stockcake.com/public/f/4/f/f4fb22c2-63dd-41e0-9fd6-6e815a984346_large/dogs-birthday-party-stockcake.jpg' className="cap-img"/>
                    <button onClick={() => navigate('/groups')}>See All Groups</button>
                </div>
                <div>
                    <img src='https://images.stockcake.com/public/6/2/6/626831e3-44d8-40ca-a90e-906b55fd17db_large/dogs-enjoying-pool-stockcake.jpg' className="cap-img"/>
                    <button onClick={() => navigate('/events')}>Find an Event</button>
                </div>
                <div>
                    <img src='https://images.stockcake.com/public/7/1/6/716ba935-fe45-494a-8cc1-a909874bdd62_large/joyful-snowy-romp-stockcake.jpg' className="cap-img" />
                    <button
                        disabled={!signedIn}
                        onClick={() => navigate('/createGroup')}>Start a Group</button>
                </div>
            </div>
            <div className="join-btn-container">
                <div className="join">
                <OpenModalMenuItem
                itemText="Join Meet Dogs!"
                onItemClick={closeMenu}
                modalComponent={<SignupFormModal />}
                /></div>
            </div>
        </div>
    )
}

export default LandingPage;
