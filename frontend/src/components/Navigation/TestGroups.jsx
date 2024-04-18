import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGroups } from "../../store/group";


function TestGroups() {
    const dispatch = useDispatch();
    const groupList = useSelector(state => state.groups)



    useEffect(() => {
        dispatch(getGroups())

    })

    console.log('grouplist ', groupList)  // empty group list


    return (
        <>
            <h1>{` array: ${groupList[1]}`}</h1>
        </>
    )
}

export default TestGroups;
