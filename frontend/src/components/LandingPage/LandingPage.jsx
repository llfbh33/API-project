import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FaBullseye } from "react-icons/fa";

import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal';
import './LandingPage.css'



// LandingPage Component
const LandingPage = () => {
    // Hooks
    const navigate = useNavigate();
    const user = useSelector(state => state.session.user)
    const ulRef = useRef(); //Reference to

    const [signedIn, setSignedIn] = useState(FaBullseye); // state to track users sign-in status
    const [showMenu, setShowMenu] = useState(false); // state to control visibility of menu

    // Effect to update sign-in status when user changes
    useEffect(() => {
        if (user) setSignedIn(true);
        else setSignedIn(false);
    }, [user, signedIn])

    // Effect to close menu is user clicks outside menu
    useEffect(() => {
        if (!showMenu) return;

        const closeMenu = (e) => {
            console.log(e.target)
          if (ulRef.current && !ulRef.current.contains(e.target)) {

            setShowMenu(false);
          }
        };

        document.addEventListener('click', closeMenu);

        return () => document.removeEventListener('click', closeMenu);
      }, [showMenu]);

      // Function to close modal
      const closeMenu = () => setShowMenu(false);

    return (
        <div className="landing">
            {/* Section One: Introduction */}
            <div className="one">
                <div className="intro">
                    <h1>Happy Dogs are Social Dogs</h1>
                    <h2>Get out and about with your best friend, find new friends to share the adventure with. Make your fur baby as happy as they make you.
                    </h2>
                </div>
                <div className="landing-title-img-container">
                    <img src='https://cdn.pixabay.com/photo/2024/01/20/17/33/dog-8521550_1280.png' alt='goofy group of dogs' className="landing-title-img"/>
                </div>
            </div>

            {/* Section Two: How Meet Dogs Works */}
            <div className='two'>
                <h3>How Meet Dogs Works</h3>
                <p>Set up playdates, join dog communities, go for hikes, whatever</p>
            </div>

            {/* Section Three: Action Buttons */}
            <div className="three">
                {/* Group */}
                <div className="cap-container" onClick={() => navigate('/groups')}>
                    <div className="landing-img-container">
                        <img src='https://images.stockcake.com/public/f/4/f/f4fb22c2-63dd-41e0-9fd6-6e815a984346_large/dogs-birthday-party-stockcake.jpg' className="landing-cap-img"/>
                    </div>
                    <button className="cap-btn">See All Groups</button>
                </div>

                {/* Events */}
                <div className="cap-container" onClick={() => navigate('/events')}>
                    <div className="landing-img-container">
                        <img src='https://images.stockcake.com/public/6/2/6/626831e3-44d8-40ca-a90e-906b55fd17db_large/dogs-enjoying-pool-stockcake.jpg' className="landing-cap-img"/>
                    </div>
                    <button className="cap-btn">Find an Event</button>
                </div>

                {/* Create Group */}
                <div className={user ? 'cap-container' : 'dis-nav'} onClick={() => user ? navigate('/createGroup') : ''}>
                    <div className="landing-img-container">
                        <img src='https://images.stockcake.com/public/7/1/6/716ba935-fe45-494a-8cc1-a909874bdd62_large/joyful-snowy-romp-stockcake.jpg' className="landing-cap-img" />
                    </div>
                    <button className="cap-btn"
                        disabled={!signedIn}
                        >Start a Group</button>
                </div>
            </div>

            {/* Join Button */}
            <div className="join-btn-container">
                <div className="join">
                    <OpenModalMenuItem
                        itemText="Join Meet Dogs!"
                        onItemClick={closeMenu}
                        modalComponent={<SignupFormModal />}
                    />
                </div>
            </div>
        </div>
    )
}

export default LandingPage;
