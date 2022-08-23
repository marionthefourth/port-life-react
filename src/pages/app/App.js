import React from "react";
import Login from '../login/Login';
import { useCookies } from 'react-cookie';
import { CookiesProvider } from 'react-cookie';
import { Route, Routes, } from 'react-router-dom';
import { Dashboard } from '../dashboard/Dashboard';
import { MetricViewer } from "../visualizations/metric-viewer/MetricViewer";

function App() {
  const [cookies, setCookie, removeCookie] = useCookies(['userAuthorized']);
  if(!cookies.userAuthorized || cookies.userAuthorized === undefined || cookies.userAuthorized === false) {
    return (
      <CookiesProvider>
        <Routes>
            <Route path="/" element={<Login />}/>
            <Route path="/demo" element={<Dashboard/>}/>
            <Route path="/viz" element={<MetricViewer/>}/>
          </Routes>
      </CookiesProvider>
    )
  }

  return (
    <>
      <CookiesProvider>
          <Routes>
            <Route path="/" element={<Dashboard />}/>
            <Route path="/viz" element={<MetricViewer/>}/>
          </Routes>
      </CookiesProvider>
    </>
  );
}

export default App;
