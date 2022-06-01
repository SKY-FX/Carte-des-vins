import React, {useState} from 'react'
import './carteDesVins.css'

import readXlsxFile from 'read-excel-file/web-worker'
import {Grid} from "@mui/material";


export default function CarteDesVins() {
  const [listeDesMillesimes, setListeDesMillesimes] =  useState([]);

  // useEffect(()=> {
  //   const input = document.getElementById('input');
  //   input.addEventListener('change', () => { 
  //     readXlsxFile(input.files[0]).then((rows) => { 
  //       // `rows` is an array of rows    // each row being an array of cells. 
  //       console.info("EFFECT", rows);
  //     })}
  //   );

  //   input.onchange();

  //   console.info("EFFECT", input);
  // }, []);

  const listeDesVins = (lignes) => {
    lignes.splice(0, 2);
    const NB_MAX = lignes.length;
    // const NB_MAX = 50;
    let millesimesSorted = lignes.slice(0, NB_MAX);
    for (let kk=0; kk<millesimesSorted.length; ++kk) millesimesSorted[kk].splice(0, 1);

    const listeVins = [];
    for (let j=0; j<NB_MAX; ++j) {
      const ligne = millesimesSorted[j];
      listeVins.push({
        Appelation : ligne[1],
        Nom : ligne[0],
        Type: ligne[2],
        Année : ligne[3],
        Description : {
          Global : ligne[4],
          Details : ligne[5]
        },
        PrixAchat : ligne[6],
        PrixVente : ligne[7],
        Position : ligne[8],
        Informations : ligne[9],
        Contenant : ligne[10]
      });
    }

    return listeVins;
  };

  const onChangeFile = (event) => {
    const input = document.getElementById('input');
    readXlsxFile(input.files[0])
    .then((lignes) => {
      const maListe = listeDesVins(lignes);
      let local_montantTotal = 0;
      maListe.map(mill => {
        if (mill.PrixVente !== null) local_montantTotal += mill.PrixVente;
        return local_montantTotal;
      })

      setListeDesMillesimes(maListe);
      // setListeDesMillesimesFiltres(maListe);
      // setMontantTotal(local_montantTotal);
      // setNbBouteilles(maListe.length);
      // setError('');
      // setLoader(false);
    })
    .catch(error => {
      setListeDesMillesimes([]);
      // setListeDesMillesimesFiltres([]);
      // setNbBouteilles(0);
      // setMontantTotal(0);
      // setError(error);
      // setLoader(false);
    });
  }


  return (
    <Grid container rowSpacing="1vw" columnSpacing="1vw">
      {listeDesMillesimes<=0 && <input type="file" id="input" style={{margin:'20px auto'}} onChange={onChangeFile}/>}
      {listeDesMillesimes.map((millesime, index) => {
        return (
          <Grid item xs={4}>
            <div key={"liste-" + index} className="carte-des-vins">
              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                <h3 style={{margin:'0'}}>{millesime.Année} {millesime.Nom ? (' - ' + millesime.Nom) : ''} {millesime.Appelation ? (' - ' + millesime.Appelation) : ''}</h3>
                <h4 style={{margin:'0'}}>{millesime.PrixVente ? (millesime.PrixVente + ' €') : 'Prix indisponible'}</h4>
              </div>

              <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                <h5 style={{margin:'5px 0 0 0'}}>{millesime.Description?.Global} {millesime.Description?.Details ? (' - ' + millesime.Description.Details) : ''}</h5>
                <h5 style={{margin:'5px 0 0 0'}}>{millesime.Type ? 'Vin ' + millesime.Type : ''} {millesime.Contenant ? (' - ' + millesime.Contenant) : ''}</h5>
              </div>
            </div>
          </Grid>
        )
      })}
    </Grid>

  )
}
