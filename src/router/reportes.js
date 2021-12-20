const express = require('express');
const router = express.Router();

const Client = require("../model/client");
const Sale = require("../model/sale");
const Report = require("../model/report");

router.get('/', (req, res) => {
    if( req.session.info ) res.render('reportes', {session: req.session.info});
    else res.redirect('/');
});


router.get("/reportesclientes", async (req, res) => {
  if( !req.session.info ) return res.redirect('/');
  try {
    const arrayClientBD = await Client.find({ubication: req.session.info.ubication});
    res.render("reportesclientes", {
        session: req.session.info,
        arrayClients: arrayClientBD
    });
  } catch (error) {}
});

router.get("/reportesventas", async (req, res) => {
  if( !req.session.info ) return res.redirect('/');
  let ubication = req.session.info.ubication;
  try {
    const arrayClientBD = await Client.find({ubication});
    const arraySaleBD = await Sale.find({ubication});
    let arrayReport =[];
    let total = 0;

    //console.log(arrayClientBD);
    //falta validar
    //res.render('ventas', {session: req.session.info});
    arrayClientBD.forEach((client) => {
      const reportF = new Report();
      reportF.id_number = client.id_number;
      reportF.name = client.name;
      reportF.totalSale = 0.0
      //total += parseFloat(reportF.totalSale)
      arraySaleBD.forEach(sale => {
            if (sale.cedula_client == client.id_number) {
              let aux = parseFloat(reportF.totalSale)
              aux += parseFloat(sale.valueSale);
              reportF.totalSale = aux
              reportF.ubication = client.ubication
            }
        }); 
        total += parseFloat(reportF.totalSale)             
        arrayReport.push(reportF)
        //console.log(reportF);
    });
    console.log(arrayReport)
    

    res.render("reportesventas", {
      session: req.session.info,
      arrayReport,
      total
    });
  } catch (error) {}
});


module.exports = router;