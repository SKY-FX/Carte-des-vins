import React from 'react'

import {Box, Typography, Card, CardContent, Rating} from "@mui/material";


import photoVin_00001 from '../../assets/Photos/ref_00005.jpg'
import photoVin_00002 from '../../assets/Photos/ref_00006.jpg'
import photoVin_00003 from '../../assets/Photos/ref_00007.jpg'
import photoVin_00004 from '../../assets/Photos/ref_00008.jpg'

const imagesVins = [
    photoVin_00001,
    photoVin_00002,
    photoVin_00003,
    photoVin_00004
  ];

const styleCard = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    p:"40px",
    mb:'40px'
}


export default function Test() {
  return (
    <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:'rgba(200,200,200,0.1)',
        p:'50px'
    }}>
        <Card sx={styleCard}>
            <img src={imagesVins[0]} alt={imagesVins[0]} style={{width:"350px", borderRadius:'10px'}}/>
            <Box sx={{textAlign:'center', ml:'50px'}}>
                <Typography sx={{fontWeight: "bold", fontFamily: 'Tangerine'}} variant="h2">Château Penaud</Typography>
                <Typography sx={{fontWeight: "regular", fontFamily: 'Quicksand'}} variant="body1">Côtes de Blaye - 1985</Typography>
                <Rating sx={{mt:'50px', color:'rgba(237, 108, 2, 1)'}} size="small" name="wine quality" value={4} precision={1} />
                {/* <Typography sx={{fontWeight: "regular", fontFamily: 'Quicksand'}} variant="body2">Bon niveau, étiquette propre, goulot abimé, bouchon propre</Typography> */}
                <Typography sx={{mt:'10px', fontWeight: "medium", fontFamily: 'Quicksand'}} variant="body1">220.00 €</Typography>
            </Box>
        </Card>

        <Card sx={styleCard}>
            <img src={imagesVins[1]} alt={imagesVins[1]} style={{width:"350px", borderRadius:'10px'}}/>
            <Box sx={{textAlign:'center', ml:'40px'}}>
                <Typography sx={{fontWeight: "bold", fontFamily: 'Tangerine'}} variant="h2">Domaine de Parenteau</Typography>
                <Typography sx={{fontWeight: "regular", fontFamily: 'Quicksand'}} variant="body1">Saint Croix Du Mont - 2018</Typography>
                <Rating sx={{mt:'50px', color:'rgba(237, 108, 2, 1)'}} size="small" name="wine quality" value={4} precision={1} />
                {/* <Typography sx={{fontWeight: "regular", fontFamily: 'Quicksand'}} variant="body2">Bon niveau, étiquette propre, goulot abimé, bouchon propre</Typography> */}
                <Typography sx={{mt:'10px', fontWeight: "medium", fontFamily: 'Quicksand'}} variant="body1">150.00 €</Typography>
            </Box>
        </Card>

        <Card sx={styleCard}>
            <img src={imagesVins[2]} alt={imagesVins[2]} style={{width:"350px", borderRadius:'10px'}}/>
            <Box sx={{textAlign:'center', ml:'40px'}}>
                <Typography sx={{fontWeight: "bold", fontFamily: 'Tangerine'}} variant="h2">Domaine de Tamary</Typography>
                <Typography sx={{fontWeight: "regular", fontFamily: 'Quicksand'}} variant="body1">Côtes de Provence - 2021</Typography>
                <Rating sx={{mt:'50px', color:'rgba(237, 108, 2, 1)'}} size="small" name="wine quality" value={4} precision={1} />
                {/* <Typography sx={{fontWeight: "regular", fontFamily: 'Quicksand'}} variant="body2">Bon niveau, étiquette propre, goulot abimé, bouchon propre</Typography> */}
                <Typography sx={{mt:'10px', fontWeight: "medium", fontFamily: 'Quicksand'}} variant="body1">120.00 €</Typography>
            </Box>
        </Card>
    </Box>
  )
}
