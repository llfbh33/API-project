import { createContext, useContext, useState } from "react";

export const GroupContext = createContext();

export const useGroupContext = () => useContext(GroupContext);

export default function GroupProvider(props) {
    const [group, setGroup] = useState({});

    return (
        <GroupContext.Provider value={(group, setGroup)}>
            {props.children}
        </GroupContext.Provider>
    )
}
