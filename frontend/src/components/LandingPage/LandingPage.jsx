import { useNavigate } from "react-router-dom";
import { useState } from "react";

import './LandingPage.css'
import { useSelector } from "react-redux";
import { useEffect } from "react";

const LandingPage = () => {
    const navigate = useNavigate();
    const user = useSelector(state => state.session.user)

    const [signedIn, setSignedIn] = useState(true);

    useEffect(() => {
        if (user) setSignedIn(false);
        if (!user) setSignedIn(true);
    }, [user, signedIn])

    return (
        <div className="landing">
            {/* <h1>landing page</h1> */}
            <div className="one">
                <div className="intro">
                    <h1>Happy Dogs are Social Dogs</h1>
                    <h3>Get out and about with your best friend, find new friends to share the adventure with. Make your fur baby as happy as they make you.
                    </h3>
                </div>
                <div>
                    <img src='https://img.freepik.com/free-vector/adorable-cartoon-puppy-friends-gathering_1308-165959.jpg?t=st=1713724229~exp=1713727829~hmac=12f3012ff57befb026f6e10e5ad1757c4d68edb9f7e516e418018fbc38967d54&w=1480' alt='goofy group of dogs' />
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
                    <button onClick={() => navigate('/groups')}>Find an Event</button>
                </div>
                <div>
                    <h3>disable this link if the user is not logged in</h3>
                    <button
                        disabled={signedIn}
                        onClick={() => navigate('/groups')}>Start a Group</button>
                </div>
            </div>

        </div>
    )
}

export default LandingPage;
