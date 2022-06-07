import React, {useState} from 'react'
import {Grid, CardActionArea, Card, CardContent, Typography} from "@mui/material";

export default function GenricCard(props) {
  const {millesime, photoVin} = props;

  const [isMouse, setIsMouse] =  useState(false);

  return (
    <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
        <Card sx={{textAlign: 'center', margin:"1vw"}}>
          <CardActionArea onMouseEnter={() => setIsMouse(true)} onMouseLeave={() => setIsMouse(false)}>
            <CardContent className={isMouse ? "card-image-hover" : "card-image"}>
              <a href={photoVin} target='_blank' rel="noreferrer">
                <img src={photoVin} alt={photoVin} style={{width:"80px"}}/>
              </a>
              <br/><br/>
              <Typography sx={{fontWeight: "bold", fontFamily: 'Quicksand'}} variant="body1">
                {millesime["Château"]??''}{millesime["Année"] ? ' - ' + millesime["Année"] : ''}
              </Typography>
            </CardContent>

            <CardContent className={isMouse ? "card-content-hover" : "card-content"} sx={{position:'absolute', padding:'20% 10%', bottom:0, top:0, left:0, right:0, backgroundColor:'rgba(237, 108, 2, 0.2)'}}>
                <Typography sx={{fontWeight: "bold", fontFamily: 'Quicksand'}} variant="body2">
                {millesime["Château"]??''}{!(millesime["Château"])?'':<br/>}
                {millesime["Ville"]??''}{!(millesime["Ville"])?'':<br/>}
                {millesime["Année"]>0 ? millesime["Année"] : 'Année non indiquée'}
                </Typography>
                <Typography sx={{fontWeight: "regular", fontFamily: 'Quicksand'}} variant="body2">
                <br/>{millesime["Type"] ? 'Vin ' + millesime["Type"] : ''} {millesime["Contenant"] ? (' - ' + millesime["Contenant"]) : ''}
                {/* <br/>{millesime.Description && (millesime.Description["Qualité"]??'')} {(millesime.Description && millesime.Description["Remarques"]) ? (' - ' + millesime.Description["Remarques"]) : ''} */}
                {
                  millesime.Description ?
                    millesime.Description["Qualité"]??''
                    :
                    'COUCOU'
                }
                <br/>
                <br/>{millesime["Prix sur le marché"] ? (millesime["Prix sur le marché"] + ' €') : 'Prix indisponible'}
                <br/>{millesime["Référence"]??''}
                </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
    </Grid>
  )
}
