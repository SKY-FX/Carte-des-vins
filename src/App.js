import React, {useState} from 'react'
import readXlsxFile from 'read-excel-file/web-worker'
import {jsPDF} from "jspdf";

function App() {

  const [listeDesMillesimesFiltres, setListeDesMillesimesFiltres] =  useState([]);
  const [montantTotal, setMontantTotal] =  useState(0);
  const [listeDesMillesimes, setListeDesMillesimes] =  useState([]);
  const [listeDesMillesimesManquants, setListeDesMillesimesManquants] =  useState([]);

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
    // setListeDesMillesimesFiltres(millesimesSorted);
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

        setListeDesMillesimes(result);
        let local_montantTotal = 0;
        result.map(mill => {
          if (mill.PrixVente !== null) local_montantTotal += mill.PrixVente;
          return local_montantTotal;
        })
        setMontantTotal(local_montantTotal);
      }
      else {
        setListeDesMillesimes([{Année : "Pas de résultat pour cette recherche : " + textToSearch}]);
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
    };
  }

  const listeDesVins = (lignes) => {
    lignes.splice(0, 2);
    // const NB_MAX = lignes.length;
    const NB_MAX = 50;
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
    readXlsxFile(input.files[0]).then((lignes) => {
      const maListe = listeDesVins(lignes);
      setListeDesMillesimes(maListe);
      setListeDesMillesimesFiltres(maListe);

      let local_montantTotal = 0;
      maListe.map(mill => {
        if (mill.PrixVente !== null) local_montantTotal += mill.PrixVente;
        return local_montantTotal;
      })

      setMontantTotal(local_montantTotal);
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
      <header style={{display: 'flex', justifyContent: 'center', margin: "2vw auto"}} className='pdfReport'>
        <h1>CATALOGUE DES MILLESIMES</h1>
      </header>
      <main>
        <input type="file" id="input" onChange={onChangeFile} style={{margin:'20px auto'}}/>
        <CarteDesVins
          listeDesMillesimes={listeDesMillesimes}
          listeDesMillesimesManquants={listeDesMillesimesManquants}
          onChangeFilter={onChangeFilter}
          onMissingYears={onMissingYears}
          onTextSearch={onTextSearch}
          montantTotal={montantTotal}
        />
      </main>
      <footer>
        <h5>Sylvain Chabaud</h5>
        <p>Développeur d'applications WEB</p>
      </footer>
    </div>
  );
}


const generatePDF = () => {

  const pdfReport = document.getElementsByClassName("pdfReport");
  var reports = Array.prototype.filter.call(pdfReport, function(testElement){
    return testElement;
  });

  const divReport = document.querySelector('#report');
  const width = divReport.clientWidth;
  const height = divReport.clientHeight;

  const globalDivPdf = document.createElement('div');

  globalDivPdf.style.margin ="40px";
  globalDivPdf.style.width= `calc(${width}px - ${globalDivPdf.style.margin}*2)`;
  globalDivPdf.style.height=`calc(${height}px - ${globalDivPdf.style.margin}*2)`;

  reports.map(report => globalDivPdf.append(report.cloneNode(true)))

  // Default export is a4 paper, portrait, using millimeters for units
  const report = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [width, height]
  });

  report.html(globalDivPdf).then(() => report.save('report.pdf'));
}

function CarteDesVins(props) {
  const {listeDesMillesimes, listeDesMillesimesManquants, onChangeFilter, onMissingYears, onTextSearch, montantTotal} = props;

  return (
    (listeDesMillesimes.length) ? <>
        <div className='pdfReport'>
          <h2>Carte des vins</h2>
          <h3>{(listeDesMillesimes[0].Année?.toString())?.indexOf("Pas de résultat") ?
            listeDesMillesimes.length
            : 0} bouteilles et magnums disponibles ({montantTotal} €)</h3>
        </div>

        <input type="button" onClick={generatePDF} value="Export PDF" style={{marginBottom:'10px', padding:'10px', borderRadius:'5px'}}/>

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
