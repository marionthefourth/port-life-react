import React from "react";
import { Route, Routes, } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { Dashboard } from '../dashboard/Dashboard';
import Login from '../login/Login';
import { useCookies } from 'react-cookie';

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['userAuthorized']);
  if(!cookies.userAuthorized || cookies.userAuthorized === undefined || cookies.userAuthorized === false) {
    return (
      <CookiesProvider>
        <Routes>
            <Route path="/" element={<Login />}/>
            <Route path="/demo" element={<Dashboard/>}/>
          </Routes>
      </CookiesProvider>
    )
  }

  return (
    <>
      <CookiesProvider>
          <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/demo" element={<Login/>}/>
          </Routes>
      </CookiesProvider>
    </>
  );
}

export default App;
