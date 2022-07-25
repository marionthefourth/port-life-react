import React, { useState } from "react";
import { Viewer } from "resium";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import Login from './Login';

function App() {
  const [token, setToken] = useState();

  if(!token) {
    return <Login setToken={setToken} />
  }

  return (
    <div className="wrapper">
      <h1>Application</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/viewer" element={<Viewer full />} />
        </Routes>
      </BrowserRouter>
    </div>
  );

}

export default App;
