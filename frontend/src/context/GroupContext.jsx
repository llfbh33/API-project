import { createContext, useContext, useState } from "react";

export const ApplicationContext = createContext();

export const useApplicationContext = () => useContext(ApplicationContext);

export default function GroupProvider(props) {
    const [currGroupId, setCurrGroupId] = useState('');
    const [currGroupPrev, setCurrGroupPrev] = useState('');
    const [currEventPrev, setCurrEventPrev] = useState('');
    const [eventLoaded, setEventLoaded] = useState(false);

    return (
        <ApplicationContext.Provider value={{
                currGroupId,
                setCurrGroupId,
                currGroupPrev,
                setCurrGroupPrev,
                currEventPrev,
                setCurrEventPrev,
                eventLoaded,
                setEventLoaded
                }}
            >
            {props.children}
        </ApplicationContext.Provider>
    )
}
