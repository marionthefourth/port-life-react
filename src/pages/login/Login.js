import React, { useState } from 'react';
import './Login.css';
import { useCookies } from 'react-cookie';
import { useNavigate } from "react-router-dom";
require("dotenv").config();

export default function Login() {

  const [QRCodeURL, setQRCodeURL] = useState('');
  const [errorNotification, setErrorNotification] = useState('');
  const [cookies, setCookie] = useCookies(['userAuthorized']);
  const navigate = useNavigate();

  const verifyCredentials = async () => {
    const options = {
      method: 'PUT',
      headers: {
        Accept: 'text/plain',
        Authorization: process.env.REACT_APP_ACCESSTOK
      }
    };

    let response = await fetch('https://api.trinsic.id/credentials/v1/verifications/policy/' + process.env.REACT_APP_POLICY_ID,
    options)
      .then(response => response.json())
      .catch(err => console.error(err));

    setQRCodeURL(response.verificationRequestUrl);

    setTimeout( () => checkCredentials(response.verificationId), 1000 * 3 );
  };

  const checkCredentials = async (verificationId) => {
    let verification = {state: "Requested"};
    let responseError = false;
    let timedOut = false;

    // stop checking if verified after 1 min
    await setTimeout(() => { timedOut = true }, 1000 * 60);

    while (!timedOut && verification.state === "Requested" && !responseError) {
      const options = {
        method: 'GET',
        headers: {
          Accept: 'text/plain',
          Authorization: process.env.REACT_APP_ACCESSTOK
        }
      };

      let response = await fetch('https://api.trinsic.id/credentials/v1/verifications/' + verificationId, options)
        .then(response => response.json())
        .catch(err => console.error(err));

      if(response.error) {
          setErrorNotification(response.error);
          responseError = true;
      }

      if(response.state === "Accepted") {
        setCookie('userAuthorized', true, {path: '/'});
        navigate("/");
        window.location.reload(true);
      }
      else if (response.state !== "Requested") {
        let errorMsg = "Something went wrong in the verification process. Verification was not accepted.";
        console.error(errorMsg);
        setErrorNotification(errorMsg);
      }
    }

    // If verification did not complete after 1 min, set error message
    if(timedOut && verification.state === "Requested" && !responseError) {
      let errorMsg = "Request has timed out"
      setErrorNotification(errorMsg);
    }
  }

  const handleVerify = async e => {
    e.preventDefault();
    setErrorNotification();
    await verifyCredentials();
  }

  return(
    <>
      <div className="wrapper">
        <div className="content">
          <div className="intro">
            <h1>Port-Life</h1>
            <h2>Verify Your Digital ID</h2>
            <p>Click the button below to initiate the verification process. Scan the QR code with the <a
            href="https://trinsic.id/trinsic-wallet/"
                target="_blank"
                rel="noopener">Trinsic mobile wallet</a> and present a valid credential for verification.
            </p>
            <div className="centerWrapper">
              <button className="btn" onClick={handleVerify}>Initiate Verification Process</button>
            </div>
            { QRCodeURL &&
                <div className="centerWrapper qrWrapper">
                  <img src={'https://chart.googleapis.com/chart?cht=qr&chl=' + QRCodeURL + '&chs=300x300&chld=L|1'}
                alt="QR Code to scan with Trinsic mobile wallet" />
                </div>
            }
            { errorNotification &&
              <div className="centerWrapper">
                <span className="error">ERROR: {errorNotification}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}
