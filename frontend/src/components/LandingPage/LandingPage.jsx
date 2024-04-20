import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import './LandingPage.css'
import { FaBullseye } from "react-icons/fa";


const LandingPage = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state.session.user)

    const [signedIn, setSignedIn] = useState(FaBullseye);

    useEffect(() => {
        if (user) setSignedIn(true);
        else setSignedIn(false);
    }, [user, signedIn])

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
                    <h3>add a pic or info?</h3>
                    <button onClick={() => navigate('/groups')}>See All Groups</button>
                </div>
                <div>
                    <h3>add a pic or info?</h3>
                    <button onClick={() => navigate('/events')}>Find an Event</button>
                </div>
                <div>
                    <h3>disable this link if the user is not logged in</h3>
                    <button
                        disabled={!signedIn}
                        onClick={() => navigate('/createGroup')}>Start a Group</button>
                </div>
            </div>

        </div>
    )
}

export default LandingPage;
