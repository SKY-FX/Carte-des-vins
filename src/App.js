import React, {useState} from 'react'
import readXlsxFile from 'read-excel-file/web-worker'
import {jsPDF} from "jspdf";

function App() {

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

  const onChangeFile = () => {
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
      })
      .catch(error => {
        setListeDesMillesimes([]);
        setListeDesMillesimesFiltres([]);
        setNbBouteilles(0);
        setMontantTotal(0);
        setError(error);
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
      <main>
        <input type="file" id="input" onChange={onChangeFile} style={{margin:'20px auto'}}/>
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

function CarteDesVins(props) {
  const {listeDesMillesimes, listeDesMillesimesManquants, onChangeFilter, onMissingYears, onTextSearch, montantTotal, nbBouteilles} = props;

  const generatePDF = () => {
    if (listeDesMillesimes) {
      // GET NAVIGATOR WIDTH
      const divReport = document.querySelector('#report');
      const HTML_Width  = divReport.clientWidth;

      // SET PDF SIZE
      const MARGIN = 40;
      var PDF_Width = HTML_Width;
      var PDF_Height = (PDF_Width*1.618);

      // CREATE MAIN PDF DIV
      const globalDivPdf = document.createElement('div');
      globalDivPdf.style.cssText = "display: flex; flex-direction: column";
      globalDivPdf.style.marginLeft = `${MARGIN }px`;
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
      pdfSousTitre.innerText = `Millésimes de 1940 à 2008`;
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
        const annee = Math.floor(millesime.Année);
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
          const nomPrec =  millesimes[ii].Nom;
          const anneePrec =  millesimes[ii].Année;

          for(let jj=ii+1; jj<millesimes.length; ++jj){
            const nomSuiv =  millesimes[jj].Nom;
            const anneeSuiv =  millesimes[jj].Année;

            if ((nomPrec === nomSuiv) && (anneePrec === anneeSuiv)) {
              millesimesByTabFinal[index].splice(jj, 1);
              jj = jj-1;
            }
          }
        }
      })

      console.info("liste", millesimesByTabFinal);

      /// CREATE CARD CONTENT
      millesimesByTabFinal.forEach((millesimeSorted) => {
        let compt = 1;
        millesimeSorted.forEach((millesime, index) => {
          /// CREATE CARD CONTENT HEADER
          const cardContentHeaderLeftDiv = document.createElement('h3');
          cardContentHeaderLeftDiv.style.cssText = "margin: 0";
          cardContentHeaderLeftDiv.innerHTML=`${millesime.Année??'Aucune année'} ${millesime.Nom ? (' - ' + millesime.Nom) : ''} ${millesime.Appelation ? (' - ' + millesime.Appelation) : ''}`;

          const cardContentHeaderRightDiv = document.createElement('h4');
          cardContentHeaderRightDiv.style.cssText = "margin: 0";
          cardContentHeaderRightDiv.innerHTML=`${millesime.PrixVente ? (millesime.PrixVente + ' €') : 'Prix indisponible'}`;

          const cardHeaderDiv = document.createElement('div');
          cardHeaderDiv.style.cssText = "display: flex; flex-direction: row; justify-content: space-between";
          cardHeaderDiv.append(cardContentHeaderLeftDiv);
          cardHeaderDiv.append(cardContentHeaderRightDiv);

          /// CREATE CARD CONTENT FOOTER
          const cardContentFooterLeftDiv = document.createElement('h5');
          cardContentFooterLeftDiv.style.cssText = "margin: 5px 0 0 0";
          cardContentFooterLeftDiv.innerHTML=`${millesime.Description?.Global??''} ${millesime.Description?.Details ? (' - ' + millesime.Description.Details) : ''}`;

          const cardContentFooterRightDiv = document.createElement('h5');
          cardContentFooterRightDiv.style.cssText = "margin: 5px 0 0 0";
          cardContentFooterRightDiv.innerHTML=`${millesime.Type ? 'Vin ' + millesime.Type : ''} ${millesime.Contenant ? (' - ' + millesime.Contenant) : ''}`;

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
        format: [PDF_Width , PDF_Height]
      });

      // ADD AND SAVE MAIN DIV TO PDF SPLIT PAGE OPTION (PDF_Height)
      pdf.html(globalDivPdf, {pagesplit: true}).then(() => pdf.save("Catalogue de vins.pdf"));
    }
    // if (listeDesMillesimes) {
    //   // GET NAVIGATOR WIDTH
    //   const divReport = document.querySelector('#report');
    //   const HTML_Width  = divReport.clientWidth;

    //   // SET PDF SIZE
    //   const MARGIN = 40;
    //   var PDF_Width = HTML_Width;
    //   var PDF_Height = (PDF_Width*1.618);

    //   // CREATE MAIN PDF DIV
    //   const globalDivPdf = document.createElement('div');
    //   globalDivPdf.style.cssText = "display: flex; flex-direction: column";
    //   globalDivPdf.style.marginLeft = `${MARGIN }px`;
    //   globalDivPdf.style.width = `${HTML_Width-MARGIN*2}px`;

    //   // CREATE HEADER
    //   const header = document.createElement('div');
    //   header.style.cssText = "display: flex; flex-direction: column; text-align: center; justify-content: center; letter-spacing: 5px";
    //   header.style.width = HTML_Width-MARGIN*2 + 'px';
    //   header.style.height = PDF_Height + 'px';

    //   const pdfTitre = document.createElement('h1');
    //   pdfTitre.innerText = "VINANTIC";
    //   header.append(pdfTitre);

    //   const pdfSousTitre = document.createElement('h3');
    //   pdfSousTitre.innerText = `Millésimes de 1940 à 2008`;
    //   header.append(pdfSousTitre);

    //   // ADD HEADER TO MAIN PDF DIV
    //   globalDivPdf.append(header);

    //   let compt = 1;
    //   listeDesMillesimes.forEach((millesime, index) => {
    //     /// CREATE CARD CONTENT HEADER
    //     const cardContentHeaderLeftDiv = document.createElement('h3');
    //     cardContentHeaderLeftDiv.style.cssText = "margin: 0";
    //     cardContentHeaderLeftDiv.innerHTML=`${millesime.Année??'Aucune année'} ${millesime.Nom ? (' - ' + millesime.Nom) : ''} ${millesime.Appelation ? (' - ' + millesime.Appelation) : ''}`;

    //     const cardContentHeaderRightDiv = document.createElement('h4');
    //     cardContentHeaderRightDiv.style.cssText = "margin: 0";
    //     cardContentHeaderRightDiv.innerHTML=`${millesime.PrixVente ? (millesime.PrixVente + ' €') : 'Prix indisponible'}`;

    //     const cardHeaderDiv = document.createElement('div');
    //     cardHeaderDiv.style.cssText = "display: flex; flex-direction: row; justify-content: space-between";
    //     cardHeaderDiv.append(cardContentHeaderLeftDiv);
    //     cardHeaderDiv.append(cardContentHeaderRightDiv);

    //     /// CREATE CARD CONTENT FOOTER
    //     const cardContentFooterLeftDiv = document.createElement('h5');
    //     cardContentFooterLeftDiv.style.cssText = "margin: 5px 0 0 0";
    //     cardContentFooterLeftDiv.innerHTML=`${millesime.Description?.Global??''} ${millesime.Description?.Details ? (' - ' + millesime.Description.Details) : ''}`;

    //     const cardContentFooterRightDiv = document.createElement('h5');
    //     cardContentFooterRightDiv.style.cssText = "margin: 5px 0 0 0";
    //     cardContentFooterRightDiv.innerHTML=`${millesime.Type ? 'Vin ' + millesime.Type : ''} ${millesime.Contenant ? (' - ' + millesime.Contenant) : ''}`;

    //     const cardFooterDiv = document.createElement('div');
    //     cardFooterDiv.style.cssText = "display: flex; flex-direction: row; justify-content: space-between";
    //     cardFooterDiv.append(cardContentFooterLeftDiv);
    //     cardFooterDiv.append(cardContentFooterRightDiv);

    //     /// CREATE CARD
    //     const cardDiv = document.createElement('div');
    //     cardDiv.style.cssText = "height: 50px; display: flex; flex-direction: column; background-color: rgba(240,240,240,0.2); border-radius: 5px; padding: 10px 20px; margin-top: 20px; border-bottom:2px solid black"
    //     cardDiv.setAttribute("key", "liste-" + index);
    //     cardDiv.append(cardHeaderDiv);
    //     cardDiv.append(cardFooterDiv);

    //     /// ADD TO MAIN DIV
    //     globalDivPdf.append(cardDiv);

    //     // GET CARD DIV HEIGHT
    //     const pxToNb = (pxValue) => parseInt((pxValue).substring(0, (pxValue).indexOf('px')));
    //     const DIV_HEIGHT = pxToNb(cardDiv.style.borderBottomWidth) + pxToNb(cardDiv.style.height) + pxToNb(cardDiv.style.padding)*2 + pxToNb(cardDiv.style.marginTop);

    //     // END PAGE MANAGER
    //     if ((compt*DIV_HEIGHT) >= (PDF_Height-DIV_HEIGHT)) {
    //       const division = document.createElement('div');
    //       division.style.cssText = `height: ${PDF_Height-compt*DIV_HEIGHT}px`;
    //       globalDivPdf.append(division);
    //       compt=1;
    //     }
    //     else ++compt;
    //   });

    //   // CREATE PDF HANDLE
    //   const pdf = new jsPDF({
    //     orientation: "portrait",
    //     unit: "pt",
    //     format: [PDF_Width , PDF_Height]
    //   });

    //   // ADD AND SAVE MAIN DIV TO PDF SPLIT PAGE OPTION (PDF_Height)
    //   pdf.html(globalDivPdf, {pagesplit: true}).then(() => pdf.save("Catalogue de vins.pdf"));
    // }
  };

  return (
    (listeDesMillesimes.length) ? <>
        <div className='pdfReport'>
          <h2>Carte des vins</h2>
          <h3>{nbBouteilles} bouteilles et magnums disponibles {montantTotal ? '(' + montantTotal + ' €)' : ""}</h3>
        </div>

        <input name="ExportPDF" type="button" id="input" onClick={generatePDF} value="EXPORT PDF" style={{marginBottom:'10px', padding:'10px'}}/>

        <div style={{display:'flex'}}>
          <div style={{flex:'1', textAlign:'center', padding:'20px', border:'1px solid black', borderRadius:'5px', backgroundColor:'rgba(100,200,200,0.9)'}}>
            <h4 style={{margin:'0 0 10px 0'}}>TRIS DES VINS</h4>
            <input name="yearsFilter" type="button" id="input" onClick={onChangeFilter} value="ANNEE" style={{marginRight:"10px", padding:'10px'}}/>
            <input name="pricesFilter" type="button" id="input" onClick={onChangeFilter} value="PRIX" style={{marginRight:"10px", padding:'10px'}}/>
            <input name="missingYears" type="button" id="input" onClick={onMissingYears} value="MILLESIMES MANQUANTS" style={{marginRight:"10px", padding:'10px'}}/>
          </div>
          <div style={{marginLeft:'10px', textAlign:'center', padding:'20px', border:'1px solid black', borderRadius:'5px', backgroundColor:'rgba(100,200,200,0.9)'}}>
            <h4 style={{margin:'0 0 10px 0'}}>FILTRES PAR MOT CLE</h4>
            <input style={{padding:'10px'}} name="yearsSearch" type="text" id="input" onChange={(e) => onTextSearch(e.target.value)} placeholder="Rechercher..."/>
          </div>
        </div>

        {listeDesMillesimesManquants.length ? <div className='pdfReport' style={{margin:'10px 0 30px 0', padding:'20px', border:'1px solid black', borderRadius:'5px', backgroundColor:'rgba(100,200,200,0.9)', textAlign:'center'}}>
          <h4 style={{margin:'0 0 10px 0'}}>{listeDesMillesimesManquants.length} Millésimes manquants entre {listeDesMillesimesManquants[0]-1} et {listeDesMillesimesManquants[listeDesMillesimesManquants.length-1]+1}</h4>
          {listeDesMillesimesManquants.map((miss, index) => <span key={'miss-' + index}>{miss} </span>)}
        </div>:<></>}

        <div className='pdfReport'>
          {listeDesMillesimes.map((millesime, index) => {
            return (
              <div
              key={"liste-" + index}
              style={{
                display:'flex',
                  flexDirection:'column',
                  margin: "1vw 0",
                  padding: '10px',
                  border: "1px solid black",
                  borderRadius: '5px',
                  backgroundColor: "rgba(200,250,200,0.2)"
                }}
                >
                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                  <h3 style={{margin:'0'}}>{millesime.Année} {millesime.Nom ? (' - ' + millesime.Nom) : ''} {millesime.Appelation ? (' - ' + millesime.Appelation) : ''}</h3>
                  <h4 style={{margin:'0'}}>{millesime.PrixVente ? (millesime.PrixVente + ' €') : 'Prix indisponible'}</h4>
                </div>

                <div style={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
                  <h5 style={{margin:'5px 0 0 0'}}>{millesime.Description?.Global} {millesime.Description?.Details ? (' - ' + millesime.Description.Details) : ''}</h5>
                  <h5 style={{margin:'5px 0 0 0'}}>{millesime.Type ? 'Vin ' + millesime.Type : ''} {millesime.Contenant ? (' - ' + millesime.Contenant) : ''}</h5>
                </div>
              </div>
            )
          })}
        </div>
    </>:<></>
  )
}

export default App;
