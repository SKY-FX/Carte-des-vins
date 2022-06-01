import React from 'react'
import {jsPDF} from "jspdf";

export default function CarteDesVins(props) {
    const {listeDesMillesimes, listeDesMillesimesManquants, onChangeFilter, onMissingYears, onTextSearch, montantTotal, nbBouteilles, setLoader} = props;

    const generatePDF = () => {
      if (listeDesMillesimes) {
        setLoader(true);

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

            for(let jj=ii+1; jj<millesimes.length; ++jj) {
              const nomSuiv =  millesimes[jj].Nom;
              const anneeSuiv =  millesimes[jj].Année;

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
        pdf.html(globalDivPdf, {pagesplit: true}).then(() => {
          pdf.save("Catalogue de vins.pdf");
          setLoader(false);
        });
      }
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
