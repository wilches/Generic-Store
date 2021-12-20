const express = require("express");
const router = express.Router();

const Client = require("../model/client");
const Sale = require("../model/sale")
const Report = require("../model/report")

router.get("/", async (req, res) => {
  if (!req.session.info) return res.redirect("/");
  let ubication = req.session.info.ubication;
  let totalGeneral = 0.0
  try {
    let cons = [
      { name: "bogota", total: 0 },
      { name: "medellin", total: 0 },
      { name: "cali", total: 0 },
    ];
    console.log(cons);
    const arrayClientBD = await Client.find(/*{ubication}*/)
    const arraySaleBD = await Sale.find(/*{ubication}*/)

    let arrayReport = [];
    let total = 0;

    //console.log("Sales..."+ arraySaleBD)

    cons.forEach(city => {
        let auxCity = 0.0
        arrayClientBD.forEach(client => {
            const report = new Report();
            report.id_number = client.id_number;
            report.name = client.name;
            report.totalSale = 0.0
            arraySaleBD.forEach(sale => {
                if (sale.cedula_client == client.id_number) {
                    let aux = parseFloat(report.totalSale)
                aux += parseFloat(sale.valueSale);
                report.totalSale = aux
                report.ubication = client.ubication   
                }                
            });
            total += parseFloat(report.totalSale)
            arrayReport.push(report)
        });
        arrayReport.forEach(report => {
            
            if (report.ubication == city.name) {                
                auxCity += parseFloat(report.totalSale)
            }
            city.total = auxCity
        });
        totalGeneral += city.total
    });
    console.log(cons)
    res.render("consolidacion", {
      session: req.session.info,
      cons,
      totalGeneral
    });
  } catch (error) {}
});

module.exports = router;
