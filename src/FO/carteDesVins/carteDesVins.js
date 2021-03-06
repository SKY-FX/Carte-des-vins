import React, {useEffect, useState} from 'react'
import './carteDesVins.css'

import XLSX from "xlsx/dist/xlsx.full.min";
import {jsPDF} from "jspdf";

import {Box, Grid, Link, Typography, Tooltip, Fade, Button, FormControl, InputLabel, OutlinedInput, InputAdornment, Pagination, Stack, Alert} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import photoVin_00001 from '../../assets/Photos/ref_00005.jpg'
import photoVin_00002 from '../../assets/Photos/ref_00006.jpg'
import photoVin_00003 from '../../assets/Photos/ref_00007.jpg'
import photoVin_00004 from '../../assets/Photos/ref_00008.jpg'
import GenricCard from './genricCard';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';

const INPUT_XLS_PATH = 'ListeMaCave.xlsx';
const NB_MILLS_PER_PAGE = 96;
const imagesVins = [
  photoVin_00001,
  photoVin_00002,
  photoVin_00003,
  photoVin_00004
]


export default function CarteDesVins() {
  const [listeDesMillesimesManquants, setListeDesMillesimesManquants] =  useState([]);
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

  useEffect(() => {
    setTimeout(() => {
      setStartEffect(true);
    }, 1000);

    fetch(INPUT_XLS_PATH)
    .then(res => res.arrayBuffer())
    .then(ab => {

      const wb = XLSX.read(ab, { type: "array" });
      const ws = wb.Sheets["Feuille1"];
      const sheetToJson = XLSX.utils.sheet_to_json(ws);

      let local_montantTotal = 0;
      sheetToJson.map(mill => {
        if (mill["Prix sur le march??"]) local_montantTotal += mill["Prix sur le march??"];
        return local_montantTotal;
      });

      setListeDesMillesimes(sheetToJson);
      setListeDesMillesimesFiltres(sheetToJson);
      setMillesimesPagination(sheetToJson.slice(0,NB_MILLS_PER_PAGE));
      setMontantTotal(local_montantTotal);
      setNbBouteilles(sheetToJson.length);
      setPage(1);
      setError('');
      setLoader(false);
    })
    .catch(error => setError(error));

  }, []);

  const onChangeFilter = (event) => {
    setLoader(true);
    let millesimesSorted = listeDesMillesimes.slice(0, listeDesMillesimes.length);
    let element='';
    if (event.target.name === 'yearsFilter') {
      element = 'Ann??e';
      setIsAnnee(true);
      setIsPrix(false);
      setIsNom(false);
    }
    else if (event.target.name === 'pricesFilter')
    {
      element = "Prix sur le march??";
      setIsAnnee(false);
      setIsPrix(true);
      setIsNom(false);
    }
    else if (event.target.name === 'namesFilter')
    {
      element = "Ch??teau";
      setIsAnnee(false);
      setIsPrix(false);
      setIsNom(true);
    }

    for (let jj=0; jj<(millesimesSorted.length-1); ++jj) {
      let [lignePredente] = JSON.parse(JSON.stringify(millesimesSorted.slice(jj, jj+1)));
      if (typeof lignePredente[element] === 'string') lignePredente[element] = lignePredente[element].trim()??'zzzzz';
      else lignePredente[element] = lignePredente[element]??99999;

      for (let ii=(jj+1); ii<(millesimesSorted.length); ++ii) {
        let [ligneCourante] = JSON.parse(JSON.stringify(millesimesSorted.slice(ii, ii+1)));
        if (typeof ligneCourante[element] === 'string') ligneCourante[element] = ligneCourante[element].trim()??'zzzzz'
        else ligneCourante[element] = ligneCourante[element]??99999;

        if (lignePredente[element] > ligneCourante[element]) {
          millesimesSorted.splice(jj, 1, JSON.parse(JSON.stringify(ligneCourante)));
          millesimesSorted.splice(ii, 1, JSON.parse(JSON.stringify(lignePredente)));
          [lignePredente] = JSON.parse(JSON.stringify(millesimesSorted.slice(jj, jj+1)));
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
    setTextSearch(textToSearch);

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
          if (mill["Prix sur le march??"]) local_montantTotal += mill["Prix sur le march??"];
          return local_montantTotal;
        })

        setListeDesMillesimes(result);
        setMillesimesPagination(result.slice(0, NB_MILLS_PER_PAGE));
        setPage(1);
        setMontantTotal(local_montantTotal);
        setNbBouteilles(result.length);
      }
      else {
        setListeDesMillesimes([{Ann??e : "Pas de r??sultat pour cette recherche : " + textToSearch}]);
        setMillesimesPagination([])
        setPage(1);
        setNbBouteilles(0);
        setMontantTotal(0);
      };
    }
    else if (millesimesSorted && textToSearch === '') {
      let local_montantTotal = 0;
      millesimesSorted.map(mill => {
          if (mill["Prix sur le march??"] !== null) local_montantTotal += mill["Prix sur le march??"];
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
    setIsAnnee(false);
    setIsPrix(false);
    setIsNom(false);
  };

  const HandlePagination = (event, page) => {
    const pageMillesimes = ( page*NB_MILLS_PER_PAGE <= listeDesMillesimes.length ) ?
                              listeDesMillesimes.slice((page-1)*NB_MILLS_PER_PAGE, page*NB_MILLS_PER_PAGE)
                              :
                              listeDesMillesimes.slice((page-1)*NB_MILLS_PER_PAGE, listeDesMillesimes.length);
    setMillesimesPagination(pageMillesimes)
    setPage(page);
    window.scrollTo(0, 0);
  }

  const generatePDF = () => {
    if (listeDesMillesimes) {
      setLoader(true);

      // GET NAVIGATOR WIDTH
      // const divReport = document.querySelector('#report');
      const HTML_Width  = 1000;
      // const HTML_Width  = divReport.clientWidth;

      // SET PDF SIZE
      const MARGIN = 40;
      var PDF_Width = HTML_Width;
      var PDF_Height = (PDF_Width*1.414);

      // CREATE MAIN PDF DIV
      const globalDivPdf = document.createElement('div');
      globalDivPdf.style.cssText = "display: flex; flex-direction: column";
      globalDivPdf.style.marginLeft = `${MARGIN}px`;
      globalDivPdf.style.width = `${HTML_Width-MARGIN*2}px`;

      // CREATE HEADER
      const header = document.createElement('div');
      header.style.cssText = "display: flex; flex-direction: column; text-align: center; justify-content: center; letter-spacing: 5px";
      header.style.width = HTML_Width-MARGIN*2 + 'px';
      header.style.height = PDF_Height + 'px';

      const pdfTitre = document.createElement('h1');
      pdfTitre.innerText = "VINANTIC";
      header.append(pdfTitre);

      const pdfSousTitre = document.createElement('h3');
      pdfSousTitre.innerText = `Mill??simes de 1940 ?? 2008`;
      header.append(pdfSousTitre);

      // ADD HEADER TO MAIN PDF DIV
      globalDivPdf.append(header);

      // MILLESIMES SORTED BY YEAR
      const millesimes_Sorted = onChangeFilter({target:{name:"yearsFilter"}});

      let millesimesByTab = [];
      let millesimesByTabFinal = [];
      let flagLoop = 0;

      // CREATE SORTED MILLESIMES YEARS IN PAGE TAB
      millesimes_Sorted.forEach((millesime, index) => {
        const annee = Math.floor(millesime["Ann??e"]);
        if((flagLoop !== annee || (millesimes_Sorted.length === index+1))) {
          if (millesimes_Sorted.length === index+1) {
            millesimesByTab.push(millesime);
          }

          flagLoop = annee;
          millesimesByTabFinal.push(millesimesByTab);
          millesimesByTab = [millesime];
        }
        else {
          millesimesByTab.push(millesime);
        }
      });

      // DELETE DOUBLON
      millesimesByTabFinal.forEach((millesimes, index) => {
        for(let ii=0; ii<millesimes.length; ++ii) {
          const nomPrec =  millesimes[ii]["Ch??teau"];
          const anneePrec =  millesimes[ii]["Ann??e"];

          for(let jj=ii+1; jj<millesimes.length; ++jj) {
            const nomSuiv =  millesimes[jj]["Ch??teau"];
            const anneeSuiv =  millesimes[jj]["Ann??e"];

            if ((nomPrec === nomSuiv) && (anneePrec === anneeSuiv)) {
              millesimesByTabFinal[index].splice(jj, 1);
              jj = jj-1;
            }
          }
        }
      })

      /// CREATE CARD CONTENT
      millesimesByTabFinal.forEach((millesimeSorted) => {
        let compt = 1;
        millesimeSorted.forEach((millesime, index) => {
          /// CREATE CARD CONTENT HEADER
          const cardContentHeaderLeftDiv = document.createElement('h3');
          cardContentHeaderLeftDiv.style.cssText = "margin: 0";
          cardContentHeaderLeftDiv.innerHTML=`${(millesime.Ann??e && millesime.Ann??e>0 && millesime.Ann??e<99999)? millesime.Ann??e : 'Ann??e non indiqu??e'} ${millesime["Ch??teau"] ? (' - ' + millesime["Ch??teau"]) : ''} ${millesime["Ville"] ? (' - ' + millesime["Ville"]) : ''}`;

          const cardContentHeaderRightDiv = document.createElement('h4');
          cardContentHeaderRightDiv.style.cssText = "margin: 0";
          cardContentHeaderRightDiv.innerHTML=`${millesime.PrixVente ? (millesime["Prix sur le march??"] + ' ???') : 'Prix indisponible'}`;

          const cardHeaderDiv = document.createElement('div');
          cardHeaderDiv.style.cssText = "display: flex; flex-direction: row; justify-content: space-between";
          cardHeaderDiv.append(cardContentHeaderLeftDiv);
          cardHeaderDiv.append(cardContentHeaderRightDiv);

          /// CREATE CARD CONTENT FOOTER
          const cardContentFooterLeftDiv = document.createElement('h5');
          cardContentFooterLeftDiv.style.cssText = "margin: 5px 0 0 0";
          cardContentFooterLeftDiv.innerHTML=`${millesime["Qualit??"]??''} ${millesime["Remarques"] ? (' - ' + millesime["Remarques"]) : ''}`;

          const cardContentFooterRightDiv = document.createElement('h5');
          cardContentFooterRightDiv.style.cssText = "margin: 5px 0 0 0";
          cardContentFooterRightDiv.innerHTML=`${millesime["Type"] ? 'Vin ' + millesime["Type"] : ''} ${millesime["Contenant"] ? (' - ' + millesime["Contenant"]) : ''}`;

          const cardFooterDiv = document.createElement('div');
          cardFooterDiv.style.cssText = "display: flex; flex-direction: row; justify-content: space-between";
          cardFooterDiv.append(cardContentFooterLeftDiv);
          cardFooterDiv.append(cardContentFooterRightDiv);

          /// CREATE CARD
          const cardDiv = document.createElement('div');
          cardDiv.style.cssText = "height: 50px; display: flex; flex-direction: column; background-color: rgba(240,240,240,0.2); border-radius: 5px; padding: 10px 20px; margin-top: 20px; border-bottom:2px solid black"
          cardDiv.setAttribute("key", "liste-" + index);
          cardDiv.append(cardHeaderDiv);
          cardDiv.append(cardFooterDiv);

          /// ADD TO MAIN DIV
          globalDivPdf.append(cardDiv);

          // GET CARD DIV HEIGHT
          const pxToNb = (pxValue) => parseInt((pxValue).substring(0, (pxValue).indexOf('px')));
          const DIV_HEIGHT = pxToNb(cardDiv.style.borderBottomWidth) + pxToNb(cardDiv.style.height) + pxToNb(cardDiv.style.padding)*2 + pxToNb(cardDiv.style.marginTop);

          // END PAGE MANAGER
          if (((compt*DIV_HEIGHT) >= (PDF_Height-DIV_HEIGHT)) || (millesimeSorted.length === index+1)) {
            // SAUT DE PAGE
            const division = document.createElement('div');
            division.style.cssText = `height: ${PDF_Height-compt*DIV_HEIGHT}px`;
            globalDivPdf.append(division);
            compt=1;
          }
          else ++compt;
        });
      })

      // CREATE PDF HANDLE
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [PDF_Width, PDF_Height]
      });

      // ADD AND SAVE MAIN DIV TO PDF SPLIT PAGE OPTION (PDF_Height)
      pdf.html(globalDivPdf, {pagesplit: true}).then(() => {
        pdf.save("Catalogue de vins - Vinantic.pdf");
        setLoader(false);
      });
    }
  };

  const onMissingYears = () => {
      let listeMillesimes = listeDesMillesimes.slice(0, listeDesMillesimes.length);

      // YEAR FILTER
      for (let jj=0; jj<(listeMillesimes.length-1); ++jj) {
        let [lignePredente] = listeMillesimes.slice(jj, jj+1);
        for (let ii=(jj+1); ii<(listeMillesimes.length); ++ii) {
          const [ligneCourante] = listeMillesimes.slice(ii, ii+1);
          if (lignePredente['Ann??e'] > ligneCourante['Ann??e']) {
            listeMillesimes.splice(jj, 1, ligneCourante);
            listeMillesimes.splice(ii, 1, lignePredente);
            [lignePredente] = listeMillesimes.slice(jj, jj+1);
          }
        }
      }

      let missingDateTab = [];
      for (let ii=0; ii<(listeMillesimes.length-1); ++ii){
        let [millesime_prec] = listeMillesimes.slice(ii, ii+1);
        let [millesime_suiv] = listeMillesimes.slice(ii+1, ii+2);

        if (millesime_prec["Ann??e"] && (millesime_suiv["Ann??e"]-millesime_prec["Ann??e"]>1)) {
          for (let jj=0; jj<(millesime_suiv["Ann??e"]-millesime_prec["Ann??e"]-1); ++jj) {
            missingDateTab.push(millesime_prec["Ann??e"] + jj + 1);
          }
        }
      }
      setListeDesMillesimesManquants(missingDateTab);
  };


  return (
    <Box sx={{mb:'1vw'}} id='report'>
      <Typography
        className={startEffect ? 'titre-effect' : 'titre'}
        sx={{textAlign:'center', padding:'20px', fontWeight: "regular", fontFamily: 'Tangerine'}}
        variant="h1"
      >
        Vinantic
      </Typography>

      <Box className="filter-bar">
        <Box className='filter-bar-menu'>
          <LoadingButton name="yearsFilter" color="warning" size="medium" loading={false} variant={isAnnee ? "contained" : "outlined"} onClick={onChangeFilter}>TRI PAR ANNEE</LoadingButton>
          <LoadingButton name="pricesFilter" color='warning' size="medium" loading={false} variant={isPrix ? "contained" : "outlined"} onClick={onChangeFilter} sx={{ml:'10px'}}>TRI PAR PRIX</LoadingButton>
          <LoadingButton name="namesFilter" color='warning' size="medium" loading={false} variant={isNom ? "contained" : "outlined"} onClick={onChangeFilter} sx={{ml:'10px'}}>TRI PAR NOM</LoadingButton>
          {/* <Tooltip sx={{ml:'10px'}} TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} title="Visualiser les mill??simes qui manquent au catalogue">
            <Button>Mill??simes manquants</Button>
          </Tooltip> */}
        </Box>
        <Box>
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

      <Alert severity={error ? "error" : nbBouteilles ? "info" : "warning"} sx={{display:'flex', alignItems:'center', mx:'1vw', mb:'10px'}}>
      { !error ?
          nbBouteilles ?
            <>
              { isAnnee ||isPrix || isNom ?
                <Typography display="inline" variant="body1" sx={{fontFamily: 'Quicksand'}}>La liste ci-dessous a ??t?? tri??es par "{isAnnee ? "Ann??e" : isPrix ? "Prix" : "Nom"}". </Typography>
                :
                <Typography display="inline" variant="body1" sx={{fontFamily: 'Quicksand'}}>La liste ci-dessous n'a pas ??t?? tri??es. </Typography>
              }

              { textSearch !== '' ?
                <>
                  <Typography display="inline" variant="body1" sx={{fontFamily: 'Quicksand'}}> Votre recherche "{textSearch}" donne {nbBouteilles} bouteilles</Typography>
                  {montantTotal>0 ? <Typography display="inline" variant="body1" sx={{fontFamily: 'Quicksand'}}> d'une valeur de {montantTotal} ???.</Typography> : "."}
                </>
                :
                <>
                  <Typography display="inline" variant="body1" sx={{fontFamily: 'Quicksand'}}>{nbBouteilles} bouteilles sont disponibles</Typography>
                  {montantTotal>0 && <Typography display="inline" variant="body1" sx={{fontFamily: 'Quicksand'}}> d'une valeur de {montantTotal} ???.</Typography>}
                </>
              }

              { (Math.ceil(listeDesMillesimes.length/NB_MILLS_PER_PAGE)>1) &&
                <Typography display="inline" variant="body1" sx={{fontFamily: 'Quicksand'}}>
                  {` Vous ??tes sur la page ${page} du catalogue.`}
                </Typography>
              }

              <Typography variant="body1" sx={{fontFamily: 'Quicksand'}}>
                <Link sx={{cursor:'pointer'}} onClick={generatePDF}>T??l??charger le catalogue au format PDF.</Link>
                {textSearch && <><br/><span>Votre recherche actuelle "{textSearch}" sera pris en comte dans le fichier PDF.</span></>}
              </Typography>

            </>
            :
            textSearch ?
              <Typography variant="body1" sx={{fontFamily: 'Quicksand'}}>Pas de r??sultat pour cette recherche : {textSearch}</Typography>
              :
              <Typography variant="body1" sx={{fontFamily: 'Quicksand'}}>Les donn??es sont indisponibles</Typography>
          :
          <Typography variant="body1" sx={{fontFamily: 'Quicksand'}}>Une erreur est apparue</Typography>
        }
      </Alert>

      { Math.ceil(listeDesMillesimes.length/NB_MILLS_PER_PAGE)>1 &&
        <Stack spacing={2} sx={{display:'flex', alignItems:'center', p:"20px 0"}}>
          <Pagination count={Math.ceil(listeDesMillesimes.length/NB_MILLS_PER_PAGE)} page={page} shape="rounded" onChange={HandlePagination}/>
        </Stack>
      }

      {
        loader ?
          <CircularProgress color="warning" size="100px" sx={{m:'auto 1vw'}}/>
          :
          nbBouteilles ?
            <>
              <Grid container sx={{backgroundColor: 'rgba(240, 240, 240, .5)'}}>
                {millesimesPagination.map((millesime, index) => {
                  return (
                    <GenricCard
                      key={"liste-" + index}
                      millesime={millesime}
                      photoVin={imagesVins[index%4]}
                    />
                )})}
              </Grid>

              {page*NB_MILLS_PER_PAGE <= listeDesMillesimes.length && <Stack spacing={2} sx={{display:'flex', alignItems:'center', p:"20px 0"}}>
                <Pagination count={Math.ceil(listeDesMillesimes.length/NB_MILLS_PER_PAGE)} page={page} shape="rounded" onChange={HandlePagination}/>
              </Stack>}
            </>
            :
            <></>
        }
    </Box>
  )
}
