import React, {useState} from 'react';
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
  const [czmlData, setCZMLData] = useState([]);

  const navigate = useNavigate();

  const logout = async () => {
    removeCookie('userAuthorized');
    window.location.reload(true);
    navigate("/");
  }

  // const file = "../../../gen_core.czml"

  const coreFile = "../../czml/gen_core.czml"
  const coreFile2 = "../../czml/electrical-v2.czml"


  // this requests the file and executes a callback with the parsed result once
  // it is available
  
  const loadCZMLFile = async () => {
    // const jsonData = require("../../czml/gen_core.czml"); 
    // console.log(jsonData);
    // setCZMLData(cur => jsonData).
    const theFile = require(coreFile)
    fetch(theFile)
      .then(response => response.json())
      .then(jsonResponse => {

        for (const i in jsonResponse) {

          console.log(jsonResponse[i]);

        }
        // console.log(jsonResponse)
        setCZMLData(jsonResponse);
      });
  }

  return(
    <>
      <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      <button style={styles.loadCZMLBtn} onClick={loadCZMLFile}>Load CZML</button>
      <div className="resium-wrapper">
        <Viewer full>
          <CzmlDataSource data={czmlData}/>
        </Viewer>
      </div>
    </>
  );
}
