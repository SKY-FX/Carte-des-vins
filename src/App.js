import React from 'react'
import BackOffice from './BO/pages/bo/backOffice';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {PRIVATE_URL, PUBLIC_URL} from './common/url_manager'
import Error404 from './BO/pages/error404/error404'
import CarteDesVins from './FO/carteDesVins/carteDesVins'
import Test from './FO/carteDesVins/test'


function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path={PRIVATE_URL.BO} element={<BackOffice/>}/>
          <Route path={PUBLIC_URL.FO} element={<CarteDesVins/>}/>
          <Route path={PUBLIC_URL.TEST} element={<Test/>}/>
          <Route path="*" element={<Error404/>}/>
        </Routes>
    </BrowserRouter>
  );
}

export default App;
