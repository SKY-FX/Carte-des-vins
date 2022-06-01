import React from 'react'
import Box from '@mui/material/Box';
import BackOffice from './BO/pages/bo/backOffice';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {PRIVATE_URL, PUBLIC_URL} from './common/url_manager'
import Error404 from './BO/pages/error404/error404'
import CarteDesVins from './FO/carteDesVins/carteDesVins'


function App() {
  console.info("PRIVATE_URL", PRIVATE_URL.BO)
  return (
    <Box>
      <BrowserRouter>
          <Routes>
            <Route path={PRIVATE_URL.BO} element={<BackOffice/>}/>
            <Route path={PUBLIC_URL.CARTE_DES_VINS} element={<CarteDesVins/>}/>
            <Route path="*" element={<Error404/>}/>
          </Routes>
      </BrowserRouter>
    </Box>
  );
}

export default App;
