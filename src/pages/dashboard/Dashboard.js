import React from 'react';
import { CzmlDataSource, Viewer } from "resium";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

const styles = {
  logoutBtn: {
    position: "absolute",
    left: "2vh",
    top: "2vh",
    zIndex: "900000",
    textTransform: "uppercase",
    fontSize: "0.8rem",
    border: "none",
    padding: "0.3rem 0.5rem",
    fontWeight: "bold",
    boxShadow: "3px 5px 8px rgba(0, 0, 0, 0.4)"
  },
  loadCZMLBtn: {
    position: "absolute",
    left: "2vh",
    top: "8vh",
    zIndex: "900000",
    textTransform: "uppercase",
    fontSize: "0.8rem",
    border: "none",
    padding: "0.3rem 0.5rem",
    fontWeight: "bold",
    boxShadow: "3px 5px 8px rgba(0, 0, 0, 0.4)"
  }
};

export function Dashboard() {
  const [cookies, setCookie, removeCookie] = useCookies(['userAuthorized']);
  const navigate = useNavigate();

  const logout = async () => {
    removeCookie('userAuthorized');
    window.location.reload(true);
    navigate("/");
  }

  const loadCZML = async () => {
    
  }

  const file = "../../../"

  return(
    <>
      <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      <button style={styles.loadCZMLBtn} onClick={loadCZML}>Load CZML</button>
      <div className="resium-wrapper">
        <Viewer full>
          <CzmlDataSource data={"../../gen_core.czml"}/>
        </Viewer>
      </div>
    </>
  );
}
