import React, {useEffect, useState} from 'react'
import './carteDesVins.css'

import readXlsxFile from 'read-excel-file/web-worker'
import {Box, Grid, Typography, FormControl, InputLabel, OutlinedInput, InputAdornment, Pagination, Stack, Alert} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import photoVin from '../../assets/Photos/ref_00001.jpg'
import GenricCard from './genricCard';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';


const NB_MILLS_PER_PAGE = 96;


export default function CarteDesVins() {
  const [listeDesMillesimes, setListeDesMillesimes] =  useState([]);
  const [listeDesMillesimesFiltres, setListeDesMillesimesFiltres] =  useState([]);
  const [millesimesPagination, setMillesimesPagination] =  useState([]);
  const [nbBouteilles, setNbBouteilles] =  useState(0);
  const [montantTotal, setMontantTotal] =  useState(0);
  const [loader, setLoader] =  useState(false);
  const [error, setError] =  useState('');
  const [isAnnee, setIsAnnee] =  useState(false);
  const [isPrix, setIsPrix] =  useState(false);
  const [isNom, setIsNom] =  useState(false);
  const [textSearch, setTextSearch] =  useState('');
  const [page, setPage] = React.useState(1);


  const [startEffect, setStartEffect] =  useState(false);

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
      setListeDesMillesimesFiltres(maListe);
      setMillesimesPagination(maListe.slice(0,NB_MILLS_PER_PAGE));
      setMontantTotal(local_montantTotal);
      setNbBouteilles(maListe.length);
      setPage(1);
      setError('');
      setLoader(false);
    })
    .catch(error => {
      setListeDesMillesimes([]);
      setListeDesMillesimesFiltres([]);
      setMillesimesPagination([]);
      setNbBouteilles(0);
      setPage(1);
      setMontantTotal(0);
      setError(error);
      setLoader(false);
    });
  };

  const onChangeFilter = (event) => {
    setLoader(true);
    let millesimesSorted = listeDesMillesimes.slice(0, listeDesMillesimes.length);
    let element='';
    if (event.target.name === 'yearsFilter') {
      element='Année';
      setIsAnnee(true);
      setIsPrix(false);
      setIsNom(false);
    }
    else if (event.target.name === 'pricesFilter')
    {
      element = "PrixVente";
      setIsAnnee(false);
      setIsPrix(true);
      setIsNom(false);
    }
    else if (event.target.name === 'namesFilter')
    {
      element = "Nom";
      setIsAnnee(false);
      setIsPrix(false);
      setIsNom(true);
    }

    for (let jj=0; jj<(millesimesSorted.length-1); ++jj) {
      let [lignePredente] = millesimesSorted.slice(jj, jj+1);
      for (let ii=(jj+1); ii<(millesimesSorted.length); ++ii) {
        const [ligneCourante] = millesimesSorted.slice(ii, ii+1);
        if (lignePredente[element] > ligneCourante[element]) {

          millesimesSorted.splice(jj, 1, ligneCourante);
          millesimesSorted.splice(ii, 1, lignePredente);
          [lignePredente] = millesimesSorted.slice(jj, jj+1);
        }
      }
    }

    setListeDesMillesimes(millesimesSorted);
    setMillesimesPagination(millesimesSorted.slice(0, NB_MILLS_PER_PAGE));
    setPage(1);
    setNbBouteilles(millesimesSorted.length);
    setTimeout(() => {setLoader(false)}, 100)
    return millesimesSorted;
  };

  const onTextSearch = (textToSearch) => {
    setLoader(true);

    let millesimesSorted = listeDesMillesimesFiltres.slice(0, listeDesMillesimesFiltres.length);
    if (millesimesSorted && textToSearch !== '') {
      let result = [];
      for (let jj=0; jj<millesimesSorted.length; ++jj) {
        let [millesime] = millesimesSorted.slice(jj, jj+1);
        const millesimeTab = Object.values(millesime);

        for (let ii=0; ii<millesimeTab.length; ++ii) {
          let [millParam] = millesimeTab.slice(ii, ii+1);

          if (millParam && typeof millParam != 'object') {
            if (typeof millParam === "number") {
              millParam = millParam.toString().toLowerCase();
            }

            if (millParam.toLowerCase().indexOf(textToSearch.toLowerCase()) !== -1) {
              result.push(millesime);
              break;
            }
          }
        }
      }

      if (result.length) {
        let local_montantTotal = 0;
        result.map(mill => {
          if (mill.PrixVente !== null) local_montantTotal += mill.PrixVente;
          return local_montantTotal;
        })
        setListeDesMillesimes(result);
        setMillesimesPagination(result.slice(0, NB_MILLS_PER_PAGE));
        setPage(1);
        setMontantTotal(local_montantTotal);
        setNbBouteilles(result.length);
      }
      else {
        setListeDesMillesimes([{Année : "Pas de résultat pour cette recherche : " + textToSearch}]);
        setMillesimesPagination([])
        setPage(1);
        setNbBouteilles(0);
        setMontantTotal(0);
        setIsAnnee(false);
        setIsPrix(false);
        setIsNom(false);
      };
    }
    else if (millesimesSorted && textToSearch === '') {
      let local_montantTotal = 0;
      millesimesSorted.map(mill => {
          if (mill.PrixVente !== null) local_montantTotal += mill.PrixVente;
          return local_montantTotal;
        }
      );
      setListeDesMillesimes(millesimesSorted);
      setMillesimesPagination(millesimesSorted.slice(0, NB_MILLS_PER_PAGE));
      setPage(1);
      setMontantTotal(local_montantTotal);
      setNbBouteilles(millesimesSorted.length);
    };

    setTimeout(() => {setLoader(false)}, 100);
  };

  useEffect(() => {
    setTimeout(() => {
      setStartEffect(true);
    }, 1000)
  }, []);

  const HandlePagination = (event, page) => {
    const pageMillesimes = ( page*NB_MILLS_PER_PAGE <= listeDesMillesimes.length ) ?
                              listeDesMillesimes.slice((page-1)*NB_MILLS_PER_PAGE, page*NB_MILLS_PER_PAGE)
                              :
                              listeDesMillesimes.slice((page-1)*NB_MILLS_PER_PAGE, listeDesMillesimes.length);
    setMillesimesPagination(pageMillesimes)
    setPage(page);
    window.scrollTo(0, 0);
  }


  return (
    <Box /*sx={{backgroundColor: 'rgba(100,100,100,1)'}}*/>
      <Typography
        className={startEffect ? 'titre-effect' : 'titre'}
        sx={{textAlign:'center', padding:'20px', fontWeight: "regular", fontFamily: 'Tangerine'}}
        variant="h1"
      >
        Vinantic
      </Typography>

      <Box sx={{display:'flex', m:'auto 1vw', py:2, px:0, alignItems:'center'}}>
        <Box sx={{flex:1, display:'flex', justifyContent:"left", borderRadius:'5px', backgroundColor:'white'}}>
          {/* <input name="missingYears" type="button" id="input" onClick={onMissingYears} value="MILLESIMES MANQUANTS" style={{marginRight:"10px", padding:'10px'}}/> */}
          <LoadingButton name="yearsFilter" color="warning" size="large" loading={false} variant={isAnnee ? "contained" : "outlined"} onClick={onChangeFilter}>TRI PAR ANNEE</LoadingButton>
          <LoadingButton name="pricesFilter" color='warning' size="large" loading={false} variant={isPrix ? "contained" : "outlined"} onClick={onChangeFilter} sx={{ml:'10px'}}>TRI PAR PRIX</LoadingButton>
          <LoadingButton name="namesFilter" color='warning' size="large" loading={false} variant={isNom ? "contained" : "outlined"} onClick={onChangeFilter} sx={{ml:'10px'}}>TRI PAR NOM</LoadingButton>
        </Box>
        <Box sx={{marginLeft:'10px', textAlign:'center'}}>
          <FormControl sx={{width: '250px'}} variant="outlined" color="warning">
            <InputLabel htmlFor="outlined-adornment-password">Rechercher...</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type='text'
              onChange={(e) => onTextSearch(e.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {}}
                    onMouseDown={() => {}}
                    edge="end"
                  >
                    {<SearchIcon />}
                  </IconButton>
                </InputAdornment>
              }
              label="Rechercher..."
            />
          </FormControl>
        </Box>
      </Box>

      <Alert severity={nbBouteilles ? "info" : "warning"} sx={{display:'flex', alignItems:'center', mx:'1vw'}}>
        {
          nbBouteilles ?
            <>
              { isAnnee ||isPrix || isNom ?
                <Typography display="inline" variant="h6" sx={{fontFamily: 'Quicksand'}}>La liste ci-dessous a été triées par "{isAnnee ? "Année" : isPrix ? "Prix" : "Nom"}". </Typography>
                :
                <Typography display="inline" variant="h6" sx={{fontFamily: 'Quicksand'}}>La liste ci-dessous n'a pas été triées. </Typography>
              }
              {
                textSearch !== '' ?
                  <Typography display="inline" variant="h6" sx={{fontFamily: 'Quicksand'}}> Votre recherche "{textSearch}" contient {nbBouteilles} bouteilles.</Typography>
                  :
                  <Typography display="inline" variant="h6" sx={{fontFamily: 'Quicksand'}}>{nbBouteilles} bouteilles sont disponibles.</Typography>
              }
              <Typography display="inline" variant="h6" sx={{fontFamily: 'Quicksand'}}> Vous êtes sur la page {page} du catalogue.</Typography>

            </>
            :
            textSearch ?
              <Typography variant="h6" sx={{fontFamily: 'Quicksand'}}>Pas de résultat pour cette recherche : {textSearch}</Typography>
              :
              <Typography variant="h6" sx={{fontFamily: 'Quicksand'}}>Les données sont indisponibles</Typography>
        }
      </Alert>

      <Stack spacing={2} sx={{display:'flex', alignItems:'center', p:"20px"}}>
        <Pagination count={Math.ceil(listeDesMillesimes.length/NB_MILLS_PER_PAGE)} page={page} shape="rounded" onChange={HandlePagination}/>
      </Stack>

      {
        loader ?
          <CircularProgress color="warning" size="100px" sx={{m:'auto 1vw'}}/>
            :
            listeDesMillesimes<=0 ?
              <input type="file" id="input" style={{margin:'auto 1vw'}} onChange={onChangeFile}/>
              :
              nbBouteilles ?
              <>
                  <Grid container sx={{backgroundColor: 'rgba(240, 240, 240, .5)'}}>
                    {millesimesPagination.map((millesime, index) => {
                      return (
                        <GenricCard
                          key={"liste-" + index}
                          millesime={millesime}
                          photoVin={photoVin}
                        />
                    )})}
                  </Grid>

                  {page*NB_MILLS_PER_PAGE <= listeDesMillesimes.length && <Stack spacing={2} sx={{display:'flex', alignItems:'center', p:"20px"}}>
                    <Pagination count={Math.ceil(listeDesMillesimes.length/NB_MILLS_PER_PAGE)} page={page} shape="rounded" onChange={HandlePagination}/>
                  </Stack>}
                </>
                :
                <></>
        }
    </Box>
  )
}
