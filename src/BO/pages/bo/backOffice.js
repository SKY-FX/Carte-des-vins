import React, {useState} from 'react'
import readXlsxFile from 'read-excel-file/web-worker'
import CircularProgress from '@mui/material/CircularProgress';
import CarteDesVins from './carteDesVins'

export default function BackOffice() {
    const [loader, setLoader] =  useState(false);
    const [montantTotal, setMontantTotal] =  useState(0);
    const [nbBouteilles, setNbBouteilles] =  useState(0);
    const [listeDesMillesimesFiltres, setListeDesMillesimesFiltres] =  useState([]);
    const [listeDesMillesimes, setListeDesMillesimes] =  useState([]);
    const [listeDesMillesimesManquants, setListeDesMillesimesManquants] =  useState([]);
    const [error, setError] =  useState('');

    const onChangeFilter = (event) => {
      let millesimesSorted = listeDesMillesimes.slice(0, listeDesMillesimes.length);
      let element = event.target.name === 'yearsFilter' ? "Année" :
        event.target.name === 'pricesFilter' ? "PrixVente" :
          '';

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
      setNbBouteilles(millesimesSorted.length);
      return millesimesSorted;
    };

    const onTextSearch = (textToSearch) => {
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
          setMontantTotal(local_montantTotal);
          setNbBouteilles(result.length);
        }
        else {
          setListeDesMillesimes([{Année : "Pas de résultat pour cette recherche : " + textToSearch}]);
          setNbBouteilles(0);
          setMontantTotal(0);
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
        setMontantTotal(local_montantTotal);
        setNbBouteilles(millesimesSorted.length);
      };
    }

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

    const clickOnChangeFile = () => setLoader(true);

    const onChangeFile = (event) => {
      event.preventDefault();
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
        setMontantTotal(local_montantTotal);
        setNbBouteilles(maListe.length);
        setError('');
        setLoader(false);
      })
      .catch(error => {
        setListeDesMillesimes([]);
        setListeDesMillesimesFiltres([]);
        setNbBouteilles(0);
        setMontantTotal(0);
        setError(error);
        setLoader(false);
      });
    }

    const onMissingYears = () => {
      let listeMillesimes = listeDesMillesimes.slice(0, listeDesMillesimes.length);

      // YEAR FILTER
      for (let jj=0; jj<(listeMillesimes.length-1); ++jj) {
        let [lignePredente] = listeMillesimes.slice(jj, jj+1);
        for (let ii=(jj+1); ii<(listeMillesimes.length); ++ii) {
          const [ligneCourante] = listeMillesimes.slice(ii, ii+1);
          if (lignePredente['Année'] > ligneCourante['Année']) {
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

        if (millesime_prec["Année"] && (millesime_suiv["Année"]-millesime_prec["Année"]>1)) {
          for (let jj=0; jj<(millesime_suiv["Année"]-millesime_prec["Année"]-1); ++jj) {
            missingDateTab.push(millesime_prec["Année"] + jj + 1);
          }
        }
      }
      setListeDesMillesimesManquants(missingDateTab);
    };

    return (
      <div style={{display: 'flex', flexDirection: 'column', margin: 'auto 5vw'}} id='report'>
        <h1>CATALOGUE DES MILLESIMES</h1>
        {loader && <CircularProgress/>}

        <main>
          <input type="file" id="input" onChange={onChangeFile} style={{margin:'20px auto'}} onClick={clickOnChangeFile}/>
          {error ?
            <h4 style={{color:'red'}}>Veuillez sélectionner un autre fichier au format excel</h4> :
            <CarteDesVins
              listeDesMillesimes={listeDesMillesimes}
              listeDesMillesimesManquants={listeDesMillesimesManquants}
              onChangeFilter={onChangeFilter}
              onMissingYears={onMissingYears}
              onTextSearch={onTextSearch}
              montantTotal={montantTotal}
              nbBouteilles={nbBouteilles}
              setLoader={setLoader}
            />
          }
        </main>
        <footer>
          <h5>Sylvain Chabaud</h5>
          <p>Développeur d'applications WEB</p>
        </footer>
      </div>
    );
  }
