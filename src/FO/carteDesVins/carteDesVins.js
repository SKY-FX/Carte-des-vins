import React, {useState} from 'react'
import './carteDesVins.css'

import readXlsxFile from 'read-excel-file/web-worker'
import {Box, Grid, CardActionArea, Card, CardContent, Typography} from "@mui/material";
import photoVin from '../../assets/Photos/ref_00001.jpg'


export default function CarteDesVins() {
  const [listeDesMillesimes, setListeDesMillesimes] =  useState([]);

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
    <Grid container spacing='1vw' sx={{padding:'1vw'}}>
      {listeDesMillesimes<=0 && <input type="file" id="input" style={{margin:'20px auto'}} onChange={onChangeFile}/>}
      {listeDesMillesimes.map((millesime, index) => {
        return (
          <Grid key={"liste-" + index} item xs={12} sm={4} md={3}>
            <Card sx={{height:'100%', textAlign: 'center'}}>
              <CardActionArea>
                <CardContent>
                  <img src={photoVin} alt={photoVin} style={{width:"50px"}}/>
                </CardContent>

                <CardContent>
                  <Typography color="black" sx={{fontWeight: "bold"}} variant="body2">
                    {millesime.Nom}
                    <br/>{millesime.Appelation}
                    <br/>{millesime.Année}
                  </Typography>
                  <Typography color="black" sx={{fontWeight: "regular"}} variant="body2">
                    <br/>{millesime.Type ? 'Vin ' + millesime.Type : ''} {millesime.Contenant ? (' - ' + millesime.Contenant) : ''}
                    <br/>{millesime.Description?.Global} {millesime.Description?.Details ? (' - ' + millesime.Description.Details) : ''}
                    <br/>
                    <br/>{millesime.PrixVente ? (millesime.PrixVente + ' €') : 'Prix indisponible'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        )
      })}
    </Grid>

  )
}
