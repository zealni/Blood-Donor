const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'hospital_coordinates.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Update RS H. Adam Malik (id: 1)
const adamMalik = data.find(h => h.id === 1);
if (adamMalik) {
  adamMalik.latitude = 3.5182954;
  adamMalik.longitude = 98.6083782;
  adamMalik.resolved_url = 'https://www.google.com/maps/place/RS+Adam+Malik/@3.5182954,98.6083782,17z/data=!3m1!4b1!4m6!3m5!1s0x303125a213ccb2b7:0xf3f662312bf15955!8m2!3d3.5182954!4d98.6083782!16s%2Fg%2F1typqrwx?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D';
  adamMalik.coords_source = 'manual_google_maps_search';
  adamMalik.status = 'Success';
}

// Update RS Mata Makassar (id: 39)
const mataMakassar = data.find(h => h.id === 39);
if (mataMakassar) {
  mataMakassar.latitude = -5.1294536;
  mataMakassar.longitude = 119.4947374;
  mataMakassar.resolved_url = 'https://www.google.com/maps/place/RS+Mata+Kemenkes+RI+Makassar/@-5.1294536,119.4947374,17z/data=!3m1!4b1!4m6!3m5!1s0x2dbefdceb34d57fd:0x45293ccdc9555ea7!8m2!3d-5.1294536!4d119.4947374!16s%2Fg%2F11sd6s1d41?entry=ttu&g_ep=EgoyMDI2MDYxMC4wIKXMDSoASAFQAw%3D%3D';
  mataMakassar.coords_source = 'manual_google_maps_search';
  mataMakassar.status = 'Success';
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated hospital_coordinates.json with manually resolved coords!');
