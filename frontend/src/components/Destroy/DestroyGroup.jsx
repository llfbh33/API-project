import { useRef, useState, useEffect } from "react";
import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import DestroyGroupModal from "./DestroyGroupModal";

import './DestroyGroup.css'


function DestroyGroup({organizer}) {

    const [showMenu, setShowMenu] = useState(false);
    const ulRef = useRef();

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
        <div className="destroy"
            hidden={!organizer}>
            <OpenModalMenuItem
                    itemText="Delete"
                    onItemClick={closeMenu}
                    modalComponent={<DestroyGroupModal />}
            />
        </div>
    )
}


export default DestroyGroup;
